using MediVault.Backend.Data;
using MediVault.Backend.Models;
using MediVault.Backend.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.ComponentModel.DataAnnotations;

namespace MediVault.Backend.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class DoctorController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly IConfiguration _configuration;
        private readonly EmailService _emailService;
        private readonly PdfService _pdfService;

        public DoctorController(AppDbContext context, IConfiguration configuration, EmailService emailService, PdfService pdfService)
        {
            _context = context;
            _configuration = configuration;
            _emailService = emailService;
            _pdfService = pdfService;
        }

        [HttpGet("{doctorId}/appointments")]
        public async Task<IActionResult> GetDoctorAppointments(int doctorId, [FromQuery] string? status = null)
        {
            var query = _context.Appointments
                .AsNoTracking()
                .Where(a => a.DoctorId == doctorId)
                .Include(a => a.Patient)
                .Include(a => a.Payment)
                .OrderByDescending(a => a.AppointmentDate)
                .Select(a => new
                {
                    a.Id,
                    a.AppointmentDate,
                    a.Status,
                    a.Notes,
                    a.PaymentRequired,
                    a.PaymentAmount,
                    a.PaymentStatus,
                    PaymentCompleted = a.Payment != null && a.Payment.PaymentStatus == "Completed",
                    PatientName = a.Patient != null ? a.Patient.Name : "",
                    PatientId = a.PatientId
                });

            if (!string.IsNullOrWhiteSpace(status))
            {
                query = query.Where(a => a.Status == status);
            }

            var result = await query.ToListAsync();
            return Ok(result);
        }

        [HttpPost("appointments/{appointmentId}/status")]
        public async Task<IActionResult> UpdateAppointmentStatus(int appointmentId, [FromBody] UpdateAppointmentStatusRequest request)
        {
            var appointment = await _context.Appointments.FirstOrDefaultAsync(a => a.Id == appointmentId);
            if (appointment == null) return NotFound(new { message = "Appointment not found" });

            if (appointment.DoctorId != request.DoctorId)
                return Unauthorized(new { message = "Not your appointment" });

            var allowed = new[] { "Pending", "Approved", "Denied", "Cancelled", "Completed" };
            if (!allowed.Contains(request.Status))
                return BadRequest(new { message = "Invalid status" });

            appointment.Status = request.Status;
            appointment.Notes = request.Notes ?? appointment.Notes;
            await _context.SaveChangesAsync();

            return Ok(new { message = "Status updated", appointment.Id, appointment.Status });
        }

        [HttpPost("appointments/{appointmentId}/request-payment")]
        public async Task<IActionResult> RequestPayment(int appointmentId, [FromBody] RequestPaymentDto request)
        {
            var appointment = await _context.Appointments
                .Include(a => a.Patient)
                .Include(a => a.Doctor)
                .FirstOrDefaultAsync(a => a.Id == appointmentId);

            if (appointment == null)
                return NotFound(new { message = "Appointment not found" });

            if (appointment.DoctorId != request.DoctorId)
                return Unauthorized(new { message = "Not your appointment" });

            if (request.Amount <= 0)
                return BadRequest(new { message = "Payment amount must be greater than 0" });

            // Update appointment with payment details
            appointment.PaymentRequired = true;
            appointment.PaymentAmount = request.Amount;
            appointment.PaymentStatus = "Pending";
            // Status remains Pending until patient completes payment

            _context.Appointments.Update(appointment);
            await _context.SaveChangesAsync();

            return Ok(new
            {
                message = "Payment request sent to patient",
                appointment = new
                {
                    appointment.Id,
                    appointment.PaymentRequired,
                    appointment.PaymentAmount,
                    appointment.PaymentStatus
                }
            });
        }

        [HttpGet("appointments/{appointmentId}/payment-status")]
        public async Task<IActionResult> GetPaymentStatus(int appointmentId)
        {
            var appointment = await _context.Appointments
                .Include(a => a.Payment)
                .FirstOrDefaultAsync(a => a.Id == appointmentId);

            if (appointment == null)
                return NotFound(new { message = "Appointment not found" });

            return Ok(new
            {
                appointmentId = appointment.Id,
                paymentRequired = appointment.PaymentRequired,
                paymentAmount = appointment.PaymentAmount,
                paymentStatus = appointment.PaymentStatus,
                payment = appointment.Payment != null ? new
                {
                    appointment.Payment.Id,
                    appointment.Payment.RazorpayOrderId,
                    appointment.Payment.RazorpayPaymentId,
                    appointment.Payment.PaymentStatus,
                    appointment.Payment.CompletedAt
                } : null
            });
        }

        [HttpGet("{doctorId}")]
        public async Task<IActionResult> GetDoctorProfile(int doctorId)
        {
            var doctor = await _context.Doctors
                .AsNoTracking()
                .Where(d => d.Id == doctorId)
                .Select(d => new
                {
                    d.Id,
                    d.Name,
                    d.Specialization,
                    d.LicenseNumber,
                    d.PhoneNumber,
                    d.ProfilePicture,
                    d.IsActive,
                    d.CreatedAt,
                    Hospital = new { d.Hospital.Id, d.Hospital.Name, d.Hospital.Address },
                    User = new { d.User.Id, d.User.Username, d.User.Email, d.User.Role }
                })
                .FirstOrDefaultAsync();

            if (doctor == null)
                return NotFound(new { message = "Doctor not found" });

            return Ok(new { doctor });
        }

        [HttpGet("hospital/{hospitalId}")]
        public async Task<IActionResult> GetDoctorsByHospital(int hospitalId)
        {
            var doctors = await _context.Doctors
                .Where(d => d.HospitalId == hospitalId)
                .Select(d => new
                {
                    d.Id,
                    d.Name,
                    d.Specialization,
                    d.LicenseNumber,
                    d.PhoneNumber,
                    d.ProfilePicture,
                    d.IsActive
                })
                .OrderBy(d => d.Name)
                .ToListAsync();

            return Ok(new { doctors });
        }

        [HttpGet("search-patients")]
        public async Task<IActionResult> SearchPatients([FromQuery] string query)
        {
            if (string.IsNullOrWhiteSpace(query))
                return BadRequest(new { message = "Search query is required" });

            var patients = await _context.Patients
                .Where(p => p.Name.Contains(query) || p.PhoneNumber.Contains(query))
                .Select(p => new
                {
                    p.Id,
                    p.Name,
                    p.Age,
                    p.Gender,
                    p.PhoneNumber,
                    p.BloodGroup,
                    p.Allergies
                })
                .ToListAsync();

            return Ok(patients);
        }

        [HttpPut("{doctorId}/profile")]
        public async Task<IActionResult> UpdateDoctorProfile(int doctorId, [FromBody] UpdateDoctorProfileRequest request)
        {
            var doctor = await _context.Doctors.FirstOrDefaultAsync(d => d.Id == doctorId);
            if (doctor == null)
                return NotFound(new { message = "Doctor not found" });

            if (!string.IsNullOrEmpty(request.Name))
                doctor.Name = request.Name;
            if (!string.IsNullOrEmpty(request.Specialization))
                doctor.Specialization = request.Specialization;
            if (!string.IsNullOrEmpty(request.PhoneNumber))
                doctor.PhoneNumber = request.PhoneNumber;
            if (!string.IsNullOrEmpty(request.ProfilePicture))
                doctor.ProfilePicture = request.ProfilePicture;

            _context.Doctors.Update(doctor);
            await _context.SaveChangesAsync();

            return Ok(new
            {
                message = "Profile updated successfully",
                doctor = new
                {
                    doctor.Id,
                    doctor.Name,
                    doctor.Specialization,
                    doctor.LicenseNumber,
                    doctor.PhoneNumber,
                    doctor.ProfilePicture,
                    doctor.IsActive
                }
            });
        }

        [HttpPut("{doctorId}/password")]
        public async Task<IActionResult> UpdateDoctorPassword(int doctorId, [FromBody] UpdateDoctorPasswordRequest request)
        {
            var doctor = await _context.Doctors.Include(d => d.User).FirstOrDefaultAsync(d => d.Id == doctorId);
            if (doctor == null)
                return NotFound(new { message = "Doctor not found" });

            if (doctor.User == null)
                return BadRequest(new { message = "User account not linked" });

            if (string.IsNullOrWhiteSpace(request.CurrentPassword) || string.IsNullOrWhiteSpace(request.NewPassword))
                return BadRequest(new { message = "Current and new password are required" });

            if (doctor.User.PasswordHash != request.CurrentPassword)
                return BadRequest(new { message = "Current password is incorrect" });

            if (request.NewPassword.Length < 6)
                return BadRequest(new { message = "New password must be at least 6 characters" });

            // Optional: basic strength check similar to registration UI
            if (!request.NewPassword.Any(char.IsUpper))
                return BadRequest(new { message = "New password must contain at least one uppercase letter" });

            doctor.User.PasswordHash = request.NewPassword;
            await _context.SaveChangesAsync();

            return Ok(new { message = "Password updated successfully" });
        }

        [HttpPost("request-access")]
        public async Task<IActionResult> RequestAccess([FromBody] RequestAccessDto request)
        {
            var doctor = await _context.Doctors.FirstOrDefaultAsync(d => d.Id == request.DoctorId);
            var patient = await _context.Patients.Include(p => p.User).FirstOrDefaultAsync(p => p.Id == request.PatientId);

            if (doctor == null || patient == null)
                return BadRequest(new { message = "Doctor or Patient not found" });

            if (patient.User == null)
                return BadRequest(new { message = "Patient user data not found" });

            // Generate OTP
            var otp = GenerateOTP();

            var accessRequest = new DoctorAccessRequest
            {
                DoctorId = request.DoctorId,
                PatientId = request.PatientId,
                AppointmentId = request.AppointmentId,
                OTP = otp,
                OTPSentAt = DateTime.UtcNow,
                Status = "Pending"
            };

            _context.DoctorAccessRequests.Add(accessRequest);
            await _context.SaveChangesAsync();

            // Send OTP via Email
            string emailSubject = "Doctor Access Request - Your OTP";
            string emailBody = $@"Hello {patient.Name},

Dr. {doctor.Name} ({doctor.Specialization}) is requesting access to your medical records.

Your OTP for verification is: {otp}

This OTP will expire in 10 minutes.

Best regards,
MediVault Team";

            await _emailService.SendEmailAsync(patient.User.Email, emailSubject, emailBody);

            return Ok(new
            {
                message = "Access request created. OTP sent to patient email.",
                accessRequestId = accessRequest.Id
            });
        }

        [HttpPost("verify-otp")]
        public async Task<IActionResult> VerifyOTP([FromBody] VerifyOTPDto request)
        {
            var accessRequest = await _context.DoctorAccessRequests
                .FirstOrDefaultAsync(ar => ar.Id == request.AccessRequestId && ar.OTP == request.OTP);

            if (accessRequest == null)
                return BadRequest(new { message = "Invalid OTP or request not found" });

            if (accessRequest.Status != "Pending")
                return BadRequest(new { message = "Access request already processed" });

            accessRequest.IsVerified = true;
            accessRequest.VerifiedAt = DateTime.UtcNow;
            accessRequest.AccessExpiresAt = DateTime.UtcNow.AddMinutes(10);
            accessRequest.Status = "Verified";

            _context.DoctorAccessRequests.Update(accessRequest);
            await _context.SaveChangesAsync();

            return Ok(new
            {
                message = "OTP verified. Access granted for 10 minutes.",
                accessRequestId = accessRequest.Id,
                expiresAt = accessRequest.AccessExpiresAt
            });
        }

        [HttpGet("patient-history/{patientId}")]
        public async Task<IActionResult> GetPatientHistory(int patientId, [FromQuery] int doctorId, [FromQuery] int accessRequestId)
        {
            // Verify doctor has valid access
            var accessRequest = await _context.DoctorAccessRequests
                .FirstOrDefaultAsync(ar => ar.Id == accessRequestId && ar.DoctorId == doctorId && ar.PatientId == patientId);

            if (accessRequest == null || !accessRequest.IsVerified)
                return Unauthorized(new { message = "Access not verified" });

            if (accessRequest.AccessExpiresAt < DateTime.UtcNow)
                return Unauthorized(new { message = "Access expired" });

            // Get patient records
            var patient = await _context.Patients
                .Include(p => p.User)
                .FirstOrDefaultAsync(p => p.Id == patientId);

            var consultations = await _context.Consultations
                .AsNoTracking()
                .Where(c => c.PatientId == patientId)
                .OrderByDescending(c => c.Date)
                .Select(c => new
                {
                    c.Id,
                    c.PatientId,
                    c.DoctorId,
                    c.HospitalId,
                    c.Date,
                    c.Diagnosis,
                    c.BP,
                    c.Sugar,
                    c.Temperature,
                    c.Medicines,
                    c.PdfPath,
                    HospitalName = c.Hospital != null ? c.Hospital.Name : "",
                    DoctorName = c.Doctor != null ? c.Doctor.Name : ""
                })
                .ToListAsync();

            return Ok(new
            {
                patient = new { patient?.Id, patient?.Name, patient?.Age, patient?.Gender },
                consultations
            });
        }

        [HttpPost("submit-consultation")]
        public async Task<IActionResult> SubmitConsultation([FromBody] SubmitConsultationDto request)
        {
            var doctor = await _context.Doctors.FirstOrDefaultAsync(d => d.Id == request.DoctorId);
            var patient = await _context.Patients.FirstOrDefaultAsync(p => p.Id == request.PatientId);
            var hospital = await _context.Hospitals.FirstOrDefaultAsync(h => h.Id == request.HospitalId);

            if (doctor == null || patient == null || hospital == null)
                return BadRequest(new { message = "Doctor, Patient, or Hospital not found" });

            // Create consultation record
            var consultation = new Consultation
            {
                PatientId = request.PatientId,
                DoctorId = request.DoctorId,
                HospitalId = request.HospitalId,
                // Use server local time so patient-facing reports show expected current time
                Date = DateTime.Now,
                Diagnosis = request.Diagnosis,
                BP = request.BP,
                Sugar = request.Sugar,
                Temperature = request.Temperature,
                Medicines = request.Medicines
            };

            _context.Consultations.Add(consultation);
            await _context.SaveChangesAsync();

            // attempt to generate PDF for this consultation
            try
            {
                if (patient != null && hospital != null)
                {
                    consultation.PdfPath = _pdfService.GenerateConsultationPdf(consultation, patient, hospital);
                    await _context.SaveChangesAsync();
                }
            }
            catch (Exception pdfEx)
            {
                Console.WriteLine($"[DoctorController] PDF generation error: {pdfEx.Message}");
            }

            return Ok(new
            {
                message = "Consultation saved successfully",
                consultationId = consultation.Id,
                PdfUrl = consultation.PdfPath
            });
        }

        [HttpPost("upload-record")]
        public async Task<IActionResult> UploadMedicalRecord([FromForm] UploadRecordDto request)
        {
            if (request.File == null || request.File.Length == 0)
                return BadRequest(new { message = "File is required" });

            var doctor = await _context.Doctors.FirstOrDefaultAsync(d => d.Id == request.DoctorId);
            var patient = await _context.Patients.FirstOrDefaultAsync(p => p.Id == request.PatientId);

            if (doctor == null || patient == null)
                return BadRequest(new { message = "Doctor or Patient not found" });

            // Save file
            var uploadsDir = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "medical-records");
            Directory.CreateDirectory(uploadsDir);

            var fileName = $"{patient.Id}_record_{DateTime.UtcNow.Ticks}_{request.RecordType}.pdf";
            var filePath = Path.Combine(uploadsDir, fileName);

            using (var stream = new FileStream(filePath, FileMode.Create))
            {
                await request.File.CopyToAsync(stream);
            }

            // Save record metadata
            var patientFile = new PatientFile
            {
                PatientId = request.PatientId,
                DoctorId = request.DoctorId,
                FileName = fileName,
                FileType = request.RecordType,
                FilePath = $"/medical-records/{fileName}",
                UploadedAt = DateTime.UtcNow,
                Description = request.Description
            };

            _context.PatientFiles.Add(patientFile);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Medical record uploaded successfully", file = patientFile });
        }

        [HttpGet("records/patient/{patientId}")]
        public async Task<IActionResult> GetPatientRecords(int patientId)
        {
            var records = await _context.PatientFiles
                .Where(pf => pf.PatientId == patientId)
                .Select(pf => new
                {
                    pf.Id,
                    pf.FileName,
                    pf.FileType,
                    pf.FilePath,
                    pf.UploadedAt,
                    pf.Description
                })
                .ToListAsync();

            return Ok(new { records });
        }

        private string GenerateOTP()
        {
            var random = new Random();
            return random.Next(100000, 999999).ToString();
        }
    }

    public class UpdateDoctorProfileRequest
    {
        public string? Name { get; set; }
        public string? Specialization { get; set; }
        public string? PhoneNumber { get; set; }
        public string? ProfilePicture { get; set; }
    }

    public class UpdateDoctorPasswordRequest
    {
        [Required]
        public string CurrentPassword { get; set; } = string.Empty;
        [Required]
        public string NewPassword { get; set; } = string.Empty;
    }

    public class RequestAccessDto
    {
        [Required]
        public int DoctorId { get; set; }
        [Required]
        public int PatientId { get; set; }
        public int? AppointmentId { get; set; }
    }

    public class VerifyOTPDto
    {
        [Required]
        public int AccessRequestId { get; set; }
        [Required]
        public string OTP { get; set; } = "";
    }

    public class UploadRecordDto
    {
        [Required]
        public int DoctorId { get; set; }
        [Required]
        public int PatientId { get; set; }
        [Required]
        public IFormFile File { get; set; } = null!;
        [Required]
        public string RecordType { get; set; } = ""; // X-Ray, Report, Prescription, etc.
        public string? Description { get; set; }
    }

    public class SubmitConsultationDto
    {
        [Required]
        public int DoctorId { get; set; }
        [Required]
        public int PatientId { get; set; }
        [Required]
        public int HospitalId { get; set; }
        public string Diagnosis { get; set; } = string.Empty;
        public string BP { get; set; } = string.Empty;
        public string Sugar { get; set; } = string.Empty;
        public string Temperature { get; set; } = string.Empty;
        public string Medicines { get; set; } = string.Empty;
    }

    public class UpdateAppointmentStatusRequest
    {
        [Required]
        public int DoctorId { get; set; }
        [Required]
        public string Status { get; set; } = "Pending";
        public string? Notes { get; set; }
    }

    public class RequestPaymentDto
    {
        [Required]
        public int DoctorId { get; set; }
        [Required]
        public decimal Amount { get; set; }
    }
}
