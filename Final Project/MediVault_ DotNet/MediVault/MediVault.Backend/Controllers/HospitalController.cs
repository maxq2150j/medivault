using MediVault.Backend.Data;
using MediVault.Backend.Models;
using MediVault.Backend.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.ComponentModel.DataAnnotations;
using System.Security.Claims;

namespace MediVault.Backend.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize(Roles = "Hospital")]
    public class HospitalController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly PdfService _pdfService;
        private readonly EmailService _emailService;

        public HospitalController(AppDbContext context, PdfService pdfService, EmailService emailService)
        {
            _context = context;
            _pdfService = pdfService;
            _emailService = emailService;
        }

        private int GetUserId() => int.Parse(User.FindFirst("UserId")?.Value ?? "0");

        [HttpGet("search-patient")]
        public async Task<IActionResult> SearchPatient([FromQuery] string query)
        {
            try
            {
                Console.WriteLine($"[SearchPatient] Query: {query}");
                if (string.IsNullOrWhiteSpace(query))
                {
                    Console.WriteLine($"[SearchPatient] Empty query provided");
                    return BadRequest("Query parameter is required");
                }

                var patients = await _context.Patients
                    .Where(p => p.PhoneNumber.Contains(query) || p.Name.Contains(query))
                    .Select(p => new { p.Id, p.Name, p.PhoneNumber, p.Age, p.Gender })
                    .ToListAsync();
                
                Console.WriteLine($"[SearchPatient] Found {patients.Count} patients");
                return Ok(patients);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[SearchPatient] Error: {ex.Message}");
                return StatusCode(500, "Error searching patients");
            }
        }

        [HttpPost("request-otp")]
        public async Task<IActionResult> RequestOtp([FromBody] OtpRequest request)
        {
            var hospitalUserId = GetUserId();
            var hospital = await _context.Hospitals.FirstOrDefaultAsync(h => h.UserId == hospitalUserId);
            if (hospital == null) return Unauthorized();

            // Generate 6 digit OTP
            var code = new Random().Next(100000, 999999).ToString();
            var record = new OtpRecord
            {
                PatientId = request.PatientId,
                Code = code,
                Expiry = DateTime.Now.AddMinutes(10), // 10 min expiry
                RequestedByHospitalId = hospital.Id
            };
            
            var patient = await _context.Patients.Include(p => p.User).FirstOrDefaultAsync(p => p.Id == request.PatientId);
            if (patient == null || patient.User == null) return NotFound("Patient or Patient User not found");
            
            _context.OtpRecords.Add(record);
            await _context.SaveChangesAsync();

            await _emailService.SendEmailAsync(patient.User.Email, "MediVault OTP", $"Your OTP for MediVault consultation is: {code}\n\nThis code is valid for 10 minutes.\n\nDo not share this OTP with anyone.\n\nRegards,\nMediVault Team");
            
            return Ok(new { Message = "OTP Sent to Email", OtpCode = code }); // Keeping code in response for demo convenience if email fails
        }

        [HttpPost("verify-otp")]
        public async Task<IActionResult> VerifyOtp([FromBody] VerifyOtpRequest request)
        {
            var otp = await _context.OtpRecords
                .Where(o => o.PatientId == request.PatientId && o.Code == request.Code && !o.IsUsed)
                .OrderByDescending(o => o.Expiry)
                .FirstOrDefaultAsync();

            if (otp == null || otp.Expiry < DateTime.Now) return BadRequest("Invalid or Expired OTP");

            otp.IsUsed = true;
            await _context.SaveChangesAsync();

            // Grant temp access or just return success token for frontend state
            return Ok(new { Message = "Access Granted" });
        }

        [HttpPost("consultation")]
        public async Task<IActionResult> AddConsultation([FromBody] CreateConsultationRequest request)
        {
            try
            {
                var hospitalUserId = GetUserId();
                var hospital = await _context.Hospitals.FirstOrDefaultAsync(h => h.UserId == hospitalUserId);
                if (hospital == null) return Unauthorized();

                var patient = await _context.Patients.FindAsync(request.PatientId);
                if (patient == null) return NotFound("Patient not found");

                var consultation = new Consultation
                {
                    PatientId = request.PatientId,
                    HospitalId = hospital.Id,
                    Date = DateTime.Now,
                    Diagnosis = request.Diagnosis,
                    BP = request.BP,
                    Sugar = request.Sugar,
                    Temperature = request.Temperature,
                    Medicines = request.Medicines
                };

                // Save consultation first to get an ID
                _context.Consultations.Add(consultation);
                await _context.SaveChangesAsync();

                // Generate PDF after consultation is saved (so we have a valid ID)
                try 
                {
                    consultation.PdfPath = _pdfService.GenerateConsultationPdf(consultation, patient, hospital);
                    // Update the consultation with the PDF path
                    await _context.SaveChangesAsync();
                }
                catch (Exception pdfEx)
                {
                    Console.WriteLine($"[HospitalController] PDF Generation Error: {pdfEx.Message}");
                    Console.WriteLine($"[HospitalController] Stack Trace: {pdfEx.StackTrace}");
                    return StatusCode(500, "Error generating PDF: " + pdfEx.Message);
                }

                return Ok(new { Message = "Consultation created", PdfUrl = consultation.PdfPath });
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[HospitalController] Consultation Error: {ex.Message}");
                Console.WriteLine($"[HospitalController] Stack Trace: {ex.StackTrace}");
                return StatusCode(500, "Error creating consultation: " + ex.Message);
            }
        }

        [HttpPost("upload-file")]
        public async Task<IActionResult> UploadFile([FromForm] int patientId, [FromForm] string fileType, [FromForm] IFormFile file)
        {
            try
            {
                Console.WriteLine($"[UploadFile] Request received. User claims: {string.Join(", ", User.Claims.Select(c => $"{c.Type}:{c.Value}"))}");
                Console.WriteLine($"[UploadFile] Is authenticated: {User.Identity?.IsAuthenticated}");
                Console.WriteLine($"[UploadFile] User role: {User.FindFirst(System.Security.Claims.ClaimTypes.Role)?.Value}");
                Console.WriteLine($"[UploadFile] UserId claim: {User.FindFirst("UserId")?.Value}");
                
                if (file == null || file.Length == 0) return BadRequest("No file uploaded");

                var hospitalUserId = GetUserId();
                Console.WriteLine($"[UploadFile] HospitalUserId from claims: {hospitalUserId}");
                
                var hospital = await _context.Hospitals.FirstOrDefaultAsync(h => h.UserId == hospitalUserId);
                if (hospital == null) return Unauthorized();

                var patient = await _context.Patients.FindAsync(patientId);
                if (patient == null) return NotFound("Patient not found");

                var uploadsFolder = Path.Combine(_context.Database.GetConnectionString() == null ? 
                    Path.Combine(Directory.GetCurrentDirectory(), "wwwroot") : 
                    Path.Combine(Directory.GetCurrentDirectory(), "wwwroot"), "uploads");
                
                if (!Directory.Exists(uploadsFolder)) Directory.CreateDirectory(uploadsFolder);

                var fileName = $"{Guid.NewGuid()}_{file.FileName}";
                var filePath = Path.Combine(uploadsFolder, fileName);

                using (var stream = new FileStream(filePath, FileMode.Create))
                {
                    await file.CopyToAsync(stream);
                }

                var patientFile = new PatientFile
                {
                    PatientId = patientId,
                    FileName = file.FileName,
                    FilePath = $"/uploads/{fileName}",
                    FileType = fileType,
                    FileSize = file.Length,
                    UploadedAt = DateTime.Now,
                    UploadedByHospitalId = hospital.Id
                };

                _context.PatientFiles.Add(patientFile);
                await _context.SaveChangesAsync();

                // Return simple response without object references to avoid circular serialization
                return Ok(new { 
                    Message = "File uploaded successfully"
                });
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[HospitalController] File Upload Error: {ex.Message}");
                return StatusCode(500, "Error uploading file: " + ex.Message);
            }
        }

        [HttpGet("patient-files/{patientId}")]
        [AllowAnonymous]
        public async Task<IActionResult> GetPatientFiles(int patientId)
        {
            try
            {
                var files = await _context.PatientFiles
                    .Where(f => f.PatientId == patientId)
                    .Select(f => new { f.Id, f.FileName, f.FilePath, f.FileType, f.UploadedAt, f.FileSize })
                    .OrderByDescending(f => f.UploadedAt)
                    .ToListAsync();

                return Ok(files);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[HospitalController] Get Files Error: {ex.Message}");
                return StatusCode(500, "Error retrieving files: " + ex.Message);
            }
        }

        [HttpPut("doctors/{doctorId}/active")]
        public async Task<IActionResult> UpdateDoctorActive(int doctorId, [FromBody] UpdateDoctorActiveRequest request)
        {
            var hospitalUserId = GetUserId();
            var hospital = await _context.Hospitals.FirstOrDefaultAsync(h => h.UserId == hospitalUserId);
            if (hospital == null) return Unauthorized();

            var doctor = await _context.Doctors.FirstOrDefaultAsync(d => d.Id == doctorId && d.HospitalId == hospital.Id);
            if (doctor == null) return NotFound(new { message = "Doctor not found in your hospital" });

            doctor.IsActive = request.IsActive;
            await _context.SaveChangesAsync();

            return Ok(new { message = $"Doctor {(request.IsActive ? "activated" : "deactivated")} successfully", doctor.Id, doctor.IsActive });
        }

        [HttpGet("doctors")]
        public async Task<IActionResult> GetHospitalDoctors()
        {
            var hospitalUserId = GetUserId();
            var hospital = await _context.Hospitals.FirstOrDefaultAsync(h => h.UserId == hospitalUserId);
            if (hospital == null) return Unauthorized();

            var doctors = await _context.Doctors
                .AsNoTracking()
                .Where(d => d.HospitalId == hospital.Id)
                .Select(d => new { d.Id, d.Name, d.Specialization, d.LicenseNumber, d.IsActive, d.CreatedAt })
                .OrderBy(d => d.Name)
                .ToListAsync();

            return Ok(doctors);
        }
    }
    public class OtpRequest { public int PatientId { get; set; } }
    public class VerifyOtpRequest { public int PatientId { get; set; } public string Code { get; set; } = ""; }
    public class CreateConsultationRequest 
    {
        public int PatientId { get; set; }
        public string Diagnosis { get; set; } = "";
        public string BP { get; set; } = "";
        public string Sugar { get; set; } = "";
        public string Temperature { get; set; } = "";
        public string Medicines { get; set; } = "[]";
    }

    public class UpdateDoctorActiveRequest
    {
        [Required]
        public bool IsActive { get; set; }
    }
}
