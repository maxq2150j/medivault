using MediVault.Backend.Data;
using MediVault.Backend.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using System.ComponentModel.DataAnnotations;
using System.Linq;

namespace MediVault.Backend.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AuthController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly IConfiguration _configuration;

        public AuthController(AppDbContext context, IConfiguration configuration)
        {
            _context = context;
            _configuration = configuration;
        }

        [HttpGet("debug/admin")]
    public async Task<IActionResult> DebugGetAdmin()
    {
        var admins = await _context.Users.Where(u => u.Role == "Admin").ToListAsync();
        return Ok(new { admins = admins.Select(a => new { a.Username, a.PasswordHash, a.Email, a.Role }) });
    }

    [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginRequest request)
        {
            if (!ModelState.IsValid)
            {
                var errors = GetFlattenedErrors();
                return BadRequest(new { errors = errors });
            }
            var user = await _context.Users.FirstOrDefaultAsync(u => u.Username == request.Username && u.PasswordHash == request.Password);
            if (user == null) 
            {
                return Unauthorized(new { message = "Invalid credentials" });
            }

            var token = GenerateJwtToken(user);
            
            // Get specific ID based on role
            int specificId = 0;
            if (user.Role == "Patient")
            {
                var p = await _context.Patients.FirstOrDefaultAsync(x => x.UserId == user.Id);
                specificId = p?.Id ?? 0;
            }
            else if (user.Role == "Hospital")
            {
                var h = await _context.Hospitals.FirstOrDefaultAsync(x => x.UserId == user.Id);
                if (h == null || !h.IsActive)
                    return Unauthorized(new { message = "Hospital account is inactive. Contact system administrator." });
                specificId = h?.Id ?? 0;
            }
            else if (user.Role == "Doctor")
            {
                var d = await _context.Doctors.FirstOrDefaultAsync(x => x.UserId == user.Id);
                if (d == null || !d.IsActive)
                    return Unauthorized(new { message = "Doctor account is inactive. Contact hospital administrator." });
                specificId = d.Id;
            }
             else if (user.Role == "Admin")
            {
                var a = await _context.Admins.FirstOrDefaultAsync(x => x.UserId == user.Id);
                specificId = a?.Id ?? 0;
            }

            return Ok(new { Token = token, Role = user.Role, UserId = user.Id, SpecificId = specificId });
        }

        [HttpPost("register/patient")]
        public async Task<IActionResult> RegisterPatient([FromBody] RegisterPatientRequest request)
        {
            if (!ModelState.IsValid)
            {
                var errors = GetFlattenedErrors();
                return BadRequest(new { errors = errors });
            }
            if (await _context.Users.AnyAsync(u => u.Username == request.Username)) 
                return BadRequest(new { message = "Username already taken" });

            var user = new User { Username = request.Username, PasswordHash = request.Password, Role = "Patient", Email = request.Email };
            _context.Users.Add(user);
            await _context.SaveChangesAsync();

            var patient = new Patient
            {
                UserId = user.Id,
                Name = request.Name,
                Age = request.Age,
                Gender = request.Gender,
                PhoneNumber = request.PhoneNumber,
            };
            _context.Patients.Add(patient);
            await _context.SaveChangesAsync();

            return Ok(new { Message = "Patient registered successfully" });
        }
        
        [HttpPost("register/hospital")]
        public async Task<IActionResult> RegisterHospital([FromBody] RegisterHospitalRequest request)
        {
             if (!ModelState.IsValid)
             {
                 var errors = GetFlattenedErrors();
                 return BadRequest(new { errors = errors });
             }
              if (await _context.Users.AnyAsync(u => u.Username == request.Username)) return BadRequest("Username taken");
              
              var user = new User { Username = request.Username, PasswordHash = request.Password, Role = "Hospital", Email = request.Email };
              _context.Users.Add(user);
              await _context.SaveChangesAsync();
              
              var hospital = new Hospital
              {
                  UserId = user.Id,
                  Name = request.Name,
                  Address = request.Address
              };
              _context.Hospitals.Add(hospital);
              await _context.SaveChangesAsync();
              
              return Ok(new { Message = "Hospital registered successfully" });
        }

        [HttpPost("register/doctor")]
        public async Task<IActionResult> RegisterDoctor([FromBody] RegisterDoctorRequest request)
        {
             if (!ModelState.IsValid)
             {
                 var errors = GetFlattenedErrors();
                 return BadRequest(new { errors = errors });
             }
              if (await _context.Users.AnyAsync(u => u.Username == request.Username)) 
                  return BadRequest(new { message = "Username already taken" });

              var hospital = await _context.Hospitals.FirstOrDefaultAsync(h => h.Id == request.HospitalId);
              if (hospital == null)
                  return BadRequest(new { message = "Hospital not found" });
              
              try
              {
                  var user = new User { Username = request.Username, PasswordHash = request.Password, Role = "Doctor", Email = request.Email };
                  _context.Users.Add(user);
                  await _context.SaveChangesAsync();
                  
                  var doctor = new Doctor
                  {
                      UserId = user.Id,
                      HospitalId = request.HospitalId,
                      Name = request.Name,
                      Specialization = request.Specialization,
                      LicenseNumber = request.LicenseNumber,
                      PhoneNumber = request.PhoneNumber,
                      IsActive = true
                  };
                  _context.Doctors.Add(doctor);
                  await _context.SaveChangesAsync();
                  
                  return Ok(new { Message = "Doctor registered successfully", DoctorId = doctor.Id });
              }
              catch (Exception ex)
              {
                  Console.WriteLine($"[RegisterDoctor] Exception: {ex.GetType().Name}");
                  Console.WriteLine($"[RegisterDoctor] Message: {ex.Message}");
                  Console.WriteLine($"[RegisterDoctor] InnerException: {ex.InnerException?.Message}");
                  return StatusCode(500, new { 
                      message = "Error registering doctor", 
                      details = ex.Message,
                      innerDetails = ex.InnerException?.Message 
                  });
              }
        }

        private string GenerateJwtToken(User user)
        {
            var keyStr = _configuration["Jwt:Key"] ?? "ThisIsASecretKeyForMediVaultApp123!";
            var key = Encoding.ASCII.GetBytes(keyStr);
            var tokenDescriptor = new SecurityTokenDescriptor
            {
                Subject = new ClaimsIdentity(new[]
                {
                    new Claim(ClaimTypes.Name, user.Username),
                    new Claim(ClaimTypes.Role, user.Role),
                    new Claim("UserId", user.Id.ToString())
                }),
                Expires = DateTime.UtcNow.AddHours(24),
                SigningCredentials = new SigningCredentials(new SymmetricSecurityKey(key), SecurityAlgorithms.HmacSha256Signature)
            };
            var tokenHandler = new JwtSecurityTokenHandler();
            var token = tokenHandler.CreateToken(tokenDescriptor);
            return tokenHandler.WriteToken(token);
        }

        private Dictionary<string, string[]> GetFlattenedErrors()
        {
            var errors = new Dictionary<string, string[]>();
            foreach (var kvp in ModelState)
            {
                var key = kvp.Key.ToLower();
                // Clean up ASP.NET's path notation: "request.username" -> "username", "$.age" -> "age"
                if (key.StartsWith("request."))
                    key = key.Substring(8); // Remove "request."
                if (key.StartsWith("$."))
                    key = key.Substring(2); // Remove "$."
                
                var errorMessages = kvp.Value!.Errors
                    .Select(e => string.IsNullOrWhiteSpace(e.ErrorMessage) ? "Invalid value" : e.ErrorMessage)
                    .ToArray();
                
                errors[key] = errorMessages;
            }
            return errors;
        }
    }

    public class LoginRequest 
    { 
        [Required(ErrorMessage = "Username is required")] 
        [RegularExpression(@"^[A-Za-z]+$", ErrorMessage = "Username must contain only letters (A-Z, a-z)")]
        public string Username { get; set; } = ""; 

        [Required(ErrorMessage = "Password is required")] 
        [RegularExpression(@"^(?=.*[A-Z]).{6,}$", ErrorMessage = "Password must be ≥6 chars with at least one uppercase letter")] 
        public string Password { get; set; } = ""; 
    }

    public class RegisterPatientRequest 
    { 
        [Required(ErrorMessage = "Username is required")] 
        [RegularExpression(@"^[A-Za-z]+$", ErrorMessage = "Username must contain only letters (A-Z, a-z)")]
        public string Username { get; set; } = ""; 

        [Required(ErrorMessage = "Password is required")] 
        [RegularExpression(@"^(?=.*[A-Z]).{6,}$", ErrorMessage = "Password must be ≥6 chars with at least one uppercase letter")] 
        public string Password { get; set; } = ""; 

        [Required(ErrorMessage = "Email is required")] 
        [EmailAddress(ErrorMessage = "Email format is invalid")] 
        [RegularExpression(@"^[^@\s]+@gmail\.com$", ErrorMessage = "Email must be a @gmail.com address")] 
        public string Email { get; set; } = ""; 

        [Required(ErrorMessage = "Name is required")] 
        public string Name { get; set; } = ""; 

        [Range(0, 120, ErrorMessage = "Age must be between 0 and 120")] 
        public int Age { get; set; } 

        [Required(ErrorMessage = "Gender is required")] 
        public string Gender { get; set; } = ""; 

        [Required(ErrorMessage = "Phone number is required")] 
        [RegularExpression(@"^\d{10}$", ErrorMessage = "Phone number must be exactly 10 digits")] 
        public string PhoneNumber { get; set; } = ""; 
    }

    public class RegisterHospitalRequest 
    { 
        [Required(ErrorMessage = "Username is required")] 
        [RegularExpression(@"^[A-Za-z]+$", ErrorMessage = "Username must contain only letters (A-Z, a-z)")]
        public string Username { get; set; } = ""; 

        [Required(ErrorMessage = "Password is required")] 
        [RegularExpression(@"^(?=.*[A-Z]).{6,}$", ErrorMessage = "Password must be ≥6 chars with at least one uppercase letter")] 
        public string Password { get; set; } = ""; 

        [Required(ErrorMessage = "Email is required")] 
        [EmailAddress(ErrorMessage = "Email format is invalid")] 
        [RegularExpression(@"^[^@\s]+@gmail\.com$", ErrorMessage = "Email must be a @gmail.com address")] 
        public string Email { get; set; } = ""; 

        [Required(ErrorMessage = "Name is required")] 
        public string Name { get; set; } = ""; 

        [Required(ErrorMessage = "Address is required")] 
        public string Address { get; set; } = ""; 
    }

    public class RegisterDoctorRequest
    {
        [Required(ErrorMessage = "Username is required")]
        [RegularExpression(@"^[A-Za-z]+$", ErrorMessage = "Username must contain only letters (A-Z, a-z)")]
        public string Username { get; set; } = "";

        [Required(ErrorMessage = "Password is required")]
        [RegularExpression(@"^(?=.*[A-Z]).{6,}$", ErrorMessage = "Password must be ≥6 chars with at least one uppercase letter")]
        public string Password { get; set; } = "";

        [Required(ErrorMessage = "Email is required")]
        [EmailAddress(ErrorMessage = "Email format is invalid")]
        public string Email { get; set; } = "";

        [Required(ErrorMessage = "Name is required")]
        public string Name { get; set; } = "";

        [Required(ErrorMessage = "Specialization is required")]
        public string Specialization { get; set; } = "";

        [Required(ErrorMessage = "License number is required")]
        public string LicenseNumber { get; set; } = "";

        [Required(ErrorMessage = "Phone number is required")]
        [RegularExpression(@"^\d{10}$", ErrorMessage = "Phone number must be exactly 10 digits")]
        public string PhoneNumber { get; set; } = "";

        [Required(ErrorMessage = "Hospital ID is required")]
        public int HospitalId { get; set; }
    }
}
