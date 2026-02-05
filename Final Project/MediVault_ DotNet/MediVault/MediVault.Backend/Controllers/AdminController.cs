using MediVault.Backend.Data;
using MediVault.Backend.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace MediVault.Backend.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize(Roles = "Admin")]
    public class AdminController : ControllerBase
    {
        private readonly AppDbContext _context;

        public AdminController(AppDbContext context)
        {
            _context = context;
        }

        [HttpGet("stats")]
        public async Task<IActionResult> GetStats()
        {
            var totalHospitals = await _context.Hospitals.CountAsync();
            var totalPatients = await _context.Patients.CountAsync();
            var totalVisits = await _context.Consultations.CountAsync();

            // Mocking daily/monthly for now or aggregating if we had dates
            var recentVisits = await _context.Consultations
                .OrderByDescending(c => c.Date)
                .Take(5)
                .Select(c => new { c.Date, HospitalName = c.Hospital != null ? c.Hospital.Name : "", PatientName = c.Patient != null ? c.Patient.Name : "" })
                .ToListAsync();

            return Ok(new { totalHospitals, totalPatients, totalVisits, recentVisits });
        }

        [HttpGet("hospitals")]
        public async Task<IActionResult> GetHospitals()
        {
            var hospitals = await _context.Hospitals
                .Include(h => h.User)
                .Select(h => new
                {
                    h.Id,
                    h.Name,
                    h.Address,
                    h.IsActive,
                    Username = h.User != null ? h.User.Username : "",
                    Email = h.User != null ? h.User.Email : ""
                })
                .ToListAsync();
            return Ok(hospitals);
        }

        [HttpPost("hospitals")]
        public async Task<IActionResult> AddHospital([FromBody] RegisterHospitalRequest request)
        {
            try
            {
                Console.WriteLine($"[AddHospital] Request: {System.Text.Json.JsonSerializer.Serialize(request)}");

                if (request == null)
                    return BadRequest("Request body cannot be empty");

                if (string.IsNullOrWhiteSpace(request.Name))
                    return BadRequest("Hospital name is required");

                if (string.IsNullOrWhiteSpace(request.Username))
                    return BadRequest("Username is required");

                if (string.IsNullOrWhiteSpace(request.Password))
                    return BadRequest("Password is required");

                if (string.IsNullOrWhiteSpace(request.Email))
                    return BadRequest("Email is required");

                if (string.IsNullOrWhiteSpace(request.Address))
                    return BadRequest("Address is required");

                if (await _context.Users.AnyAsync(u => u.Username == request.Username))
                    return BadRequest("Username taken");

                var user = new User
                {
                    Username = request.Username,
                    PasswordHash = request.Password,
                    Role = "Hospital",
                    Email = request.Email
                };
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

                return Ok(new { Message = "Hospital added successfully" });
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[AddHospital] Error: {ex.Message}");
                return StatusCode(500, "Error adding hospital: " + ex.Message);
            }
        }

        [HttpGet("doctors")]
        public async Task<IActionResult> GetAllDoctors()
        {
            var doctors = await _context.Doctors
                .Include(d => d.User)
                .Include(d => d.Hospital)
                .Select(d => new
                {
                    d.Id,
                    d.Name,
                    d.Specialization,
                    d.LicenseNumber,
                    d.PhoneNumber,
                    d.IsActive,
                    HospitalName = d.Hospital != null ? d.Hospital.Name : "Unknown",
                    Username = d.User != null ? d.User.Username : "",
                    Email = d.User != null ? d.User.Email : ""
                })
                .OrderBy(d => d.Name)
                .ToListAsync();
            return Ok(doctors);
        }

        [HttpPut("doctors/{doctorId}/toggle-status")]
        public async Task<IActionResult> ToggleDoctorStatus(int doctorId)
        {
            try
            {
                var doctor = await _context.Doctors.FindAsync(doctorId);
                if (doctor == null)
                    return NotFound("Doctor not found");

                doctor.IsActive = !doctor.IsActive;
                await _context.SaveChangesAsync();

                return Ok(new { Message = $"Doctor {(doctor.IsActive ? "activated" : "deactivated")} successfully", IsActive = doctor.IsActive });
            }
            catch (Exception ex)
            {
                return StatusCode(500, "Error updating doctor status: " + ex.Message);
            }
        }

        [HttpPut("hospitals/{id}/toggle-status")]
        public async Task<IActionResult> ToggleHospitalStatus(int id)
        {
            try
            {
                var hospital = await _context.Hospitals.FindAsync(id);
                if (hospital == null)
                    return NotFound("Hospital not found");

                hospital.IsActive = !hospital.IsActive;
                await _context.SaveChangesAsync();

                return Ok(new { Message = $"Hospital {(hospital.IsActive ? "activated" : "deactivated")} successfully", IsActive = hospital.IsActive });
            }
            catch (Exception ex)
            {
                return StatusCode(500, "Error updating hospital status: " + ex.Message);
            }
        }
    }
}
