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
    public class PatientController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly PaymentService _paymentService;

        public PatientController(AppDbContext context, PaymentService paymentService)
        {
            _context = context;
            _paymentService = paymentService;
        }

        [HttpGet("hospitals")]
        public async Task<IActionResult> GetHospitals()
        {
            var hospitals = await _context.Hospitals
                .AsNoTracking()
                .Select(h => new { h.Id, h.Name, h.Address, h.ContactNumber })
                .OrderBy(h => h.Name)
                .ToListAsync();
            return Ok(hospitals);
        }

        [HttpGet("doctors-by-hospital/{hospitalId}")]
        public async Task<IActionResult> GetDoctorsByHospital(int hospitalId)
        {
            var doctors = await _context.Doctors
                .AsNoTracking()
                .Where(d => d.HospitalId == hospitalId && d.IsActive)
                .Select(d => new { d.Id, d.Name, d.Specialization, d.LicenseNumber, d.HospitalId })
                .OrderBy(d => d.Name)
                .ToListAsync();
            return Ok(doctors);
        }

        private int GetUserId() => int.Parse(User.FindFirst("UserId")?.Value ?? "0");

        [HttpGet("profile")]
        [Authorize(Roles = "Patient")]
        public async Task<IActionResult> GetProfile()
        {
            var userId = GetUserId();
            var patient = await _context.Patients.FirstOrDefaultAsync(p => p.UserId == userId);
            if (patient == null) return NotFound();
            return Ok(patient);
        }

        [HttpGet("records")]
        public async Task<IActionResult> GetRecords(int? patientId = null)
        {
            int targetPatientId;

            if (patientId.HasValue)
            {
                // Called from Hospital Dashboard (no authorization check needed)
                targetPatientId = patientId.Value;
            }
            else
            {
                // Called from Patient Dashboard (requires patient role)
                if (!User.IsInRole("Patient"))
                    return Forbid();

                var userId = GetUserId();
                var patient = await _context.Patients.FirstOrDefaultAsync(p => p.UserId == userId);
                if (patient == null) return NotFound();
                targetPatientId = patient.Id;
            }

            var records = await _context.Consultations
                .Where(c => c.PatientId == targetPatientId)
                .Include(c => c.Hospital)
                .Include(c => c.Doctor)
                .OrderByDescending(c => c.Date)
                .Select(c => new
                {
                    c.Id,
                    c.Date,
                    HospitalName = c.Hospital != null ? c.Hospital.Name : "Unknown",
                    DoctorName = c.Doctor != null ? c.Doctor.Name : "Unknown",
                    c.Diagnosis,
                    c.PdfPath
                })
                .ToListAsync();

            return Ok(records);
        }

        [HttpGet("otp-history")]
        [Authorize(Roles = "Patient")]
        public async Task<IActionResult> GetOtpHistory()
        {
            var userId = GetUserId();
            var patient = await _context.Patients.FirstOrDefaultAsync(p => p.UserId == userId);
            if (patient == null) return NotFound();

            var otps = await _context.OtpRecords
                .Where(o => o.PatientId == patient.Id)
                .OrderByDescending(o => o.Expiry)
                .ToListAsync();

            return Ok(otps);
        }

        [HttpGet("consultations")]
        [Authorize(Roles = "Patient")]
        public async Task<IActionResult> GetConsultations()
        {
            var userId = GetUserId();
            var patient = await _context.Patients.FirstOrDefaultAsync(p => p.UserId == userId);
            if (patient == null) return NotFound();

            var consultations = await _context.Consultations
                .AsNoTracking()
                .Where(c => c.PatientId == patient.Id)
                .OrderByDescending(c => c.Date)
                .Select(c => new
                {
                    c.Id,
                    c.PatientId,
                    c.HospitalId,
                    c.Date,
                    c.Diagnosis,
                    c.BP,
                    c.Sugar,
                    c.Temperature,
                    c.Medicines,
                    c.PdfPath
                })
                .ToListAsync();

            return Ok(consultations);
        }

        [HttpPost("appointments")]
        [Authorize(Roles = "Patient")]
        public async Task<IActionResult> CreateAppointment([FromBody] CreateAppointmentRequest request)
        {
            var userId = GetUserId();
            var patient = await _context.Patients.FirstOrDefaultAsync(p => p.UserId == userId);
            if (patient == null) return NotFound(new { message = "Patient not found" });

            // Validate appointment date is not in the past
            if (request.AppointmentDate < DateTime.UtcNow)
                return BadRequest(new { message = "Appointment date cannot be in the past" });

            var doctor = await _context.Doctors.Include(d => d.Hospital).FirstOrDefaultAsync(d => d.Id == request.DoctorId);
            if (doctor == null) return BadRequest(new { message = "Doctor not found" });

            if (request.HospitalId.HasValue && doctor.HospitalId != request.HospitalId.Value)
                return BadRequest(new { message = "Doctor does not belong to selected hospital" });

            var appointment = new Appointment
            {
                PatientId = patient.Id,
                DoctorId = doctor.Id,
                AppointmentDate = request.AppointmentDate,
                Status = "Pending",
                Notes = request.Notes ?? string.Empty
            };

            _context.Appointments.Add(appointment);
            await _context.SaveChangesAsync();

            return Ok(new
            {
                appointment.Id,
                appointment.PatientId,
                appointment.DoctorId,
                appointment.AppointmentDate,
                appointment.Status,
                appointment.Notes,
                DoctorName = doctor.Name,
                HospitalName = doctor.Hospital?.Name ?? ""
            });
        }

        [HttpGet("appointments")]
        [Authorize(Roles = "Patient")]
        public async Task<IActionResult> GetMyAppointments()
        {
            var userId = GetUserId();
            var patient = await _context.Patients.FirstOrDefaultAsync(p => p.UserId == userId);
            if (patient == null) return NotFound(new { message = "Patient not found" });

            var appointments = await _context.Appointments
                .AsNoTracking()
                .Where(a => a.PatientId == patient.Id)
                .OrderByDescending(a => a.AppointmentDate)
                .Include(a => a.Doctor)
                .ThenInclude(d => d.Hospital)
                .Include(a => a.Payment)
                .Select(a => new
                {
                    a.Id,
                    a.AppointmentDate,
                    a.Status,
                    a.Notes,
                    a.PaymentRequired,
                    a.PaymentAmount,
                    a.PaymentStatus,
                    DoctorName = a.Doctor != null ? a.Doctor.Name : "",
                    HospitalName = a.Doctor != null && a.Doctor.Hospital != null ? a.Doctor.Hospital.Name : "",
                    Payment = a.Payment != null ? new
                    {
                        a.Payment.Id,
                        a.Payment.RazorpayOrderId,
                        a.Payment.RazorpayPaymentId,
                        a.Payment.PaymentStatus,
                        a.Payment.CompletedAt
                    } : null
                })
                .ToListAsync();

            return Ok(appointments);
        }

        [HttpPost("appointments/{appointmentId}/initiate-payment")]
        [Authorize(Roles = "Patient")]
        public async Task<IActionResult> InitiatePayment(int appointmentId)
        {
            var userId = GetUserId();
            var patient = await _context.Patients.Include(p => p.User).FirstOrDefaultAsync(p => p.UserId == userId);
            if (patient == null) return NotFound(new { message = "Patient not found" });

            var appointment = await _context.Appointments
                .Include(a => a.Payment)
                .FirstOrDefaultAsync(a => a.Id == appointmentId && a.PatientId == patient.Id);

            if (appointment == null)
                return NotFound(new { message = "Appointment not found" });

            if (!appointment.PaymentRequired || appointment.PaymentAmount <= 0)
                return BadRequest(new { message = "Payment not required for this appointment" });

            if (appointment.PaymentStatus == "Completed")
                return BadRequest(new { message = "Payment already completed" });

            // Create or update payment record
            Payment payment = appointment.Payment ?? new Payment { AppointmentId = appointmentId };

            // Create order with Razorpay
            var (success, orderId, error) = await _paymentService.CreateOrderAsync(
                appointment.PaymentAmount.Value,
                appointmentId.ToString(),
                patient.User?.Email ?? "",
                patient.PhoneNumber ?? ""
            );

            if (!success)
                return BadRequest(new { message = "Failed to create payment order", error });

            payment.Amount = appointment.PaymentAmount.Value;
            payment.RazorpayOrderId = orderId;
            payment.PaymentStatus = "Pending";

            if (appointment.Payment == null)
            {
                _context.Payments.Add(payment);
            }
            else
            {
                _context.Payments.Update(payment);
            }

            await _context.SaveChangesAsync();

            return Ok(new
            {
                orderId,
                amount = appointment.PaymentAmount.Value,
                currency = "INR",
                patientName = patient.Name,
                patientEmail = patient.User?.Email ?? "",
                razorpayKeyId = _paymentService.GetRazorpayKeyId()
            });
        }

        [HttpPost("appointments/{appointmentId}/verify-payment")]
        [Authorize(Roles = "Patient")]
        public async Task<IActionResult> VerifyPayment(int appointmentId, [FromBody] VerifyPaymentRequest request)
        {
            var userId = GetUserId();
            var patient = await _context.Patients.FirstOrDefaultAsync(p => p.UserId == userId);
            if (patient == null) return NotFound(new { message = "Patient not found" });

            var appointment = await _context.Appointments
                .Include(a => a.Payment)
                .FirstOrDefaultAsync(a => a.Id == appointmentId && a.PatientId == patient.Id);

            if (appointment == null)
                return NotFound(new { message = "Appointment not found" });

            var payment = appointment.Payment;
            if (payment == null)
                return BadRequest(new { message = "Payment record not found" });

            // Verify signature
            var isValid = _paymentService.VerifyPaymentSignature(
                payment.RazorpayOrderId ?? "",
                request.PaymentId,
                request.Signature
            );

            if (!isValid)
                return BadRequest(new { message = "Invalid payment signature" });

            // Update payment record
            payment.RazorpayPaymentId = request.PaymentId;
            payment.RazorpaySignature = request.Signature;
            payment.PaymentStatus = "Completed";
            payment.CompletedAt = DateTime.UtcNow;

            appointment.PaymentStatus = "Completed";
            appointment.Status = "Approved"; // Only approve after successful payment

            _context.Payments.Update(payment);
            _context.Appointments.Update(appointment);
            await _context.SaveChangesAsync();

            return Ok(new
            {
                message = "Payment verified successfully",
                paymentStatus = "Completed",
                appointmentStatus = appointment.Status
            });
        }

        [HttpGet("appointments/{appointmentId}/payment-status")]
        [Authorize(Roles = "Patient")]
        public async Task<IActionResult> GetAppointmentPaymentStatus(int appointmentId)
        {
            var userId = GetUserId();
            var patient = await _context.Patients.FirstOrDefaultAsync(p => p.UserId == userId);
            if (patient == null) return NotFound(new { message = "Patient not found" });

            var appointment = await _context.Appointments
                .Include(a => a.Payment)
                .FirstOrDefaultAsync(a => a.Id == appointmentId && a.PatientId == patient.Id);

            if (appointment == null)
                return NotFound(new { message = "Appointment not found" });

            return Ok(new
            {
                appointmentId = appointment.Id,
                paymentRequired = appointment.PaymentRequired,
                paymentAmount = appointment.PaymentAmount,
                paymentStatus = appointment.PaymentStatus,
                appointmentStatus = appointment.Status,
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
    }

    public class CreateAppointmentRequest
    {
        [Required]
        public int DoctorId { get; set; }
        public int? HospitalId { get; set; }
        [Required]
        public DateTime AppointmentDate { get; set; }
        public string? Notes { get; set; }
    }

    public class VerifyPaymentRequest
    {
        [Required]
        public string PaymentId { get; set; } = "";
        [Required]
        public string Signature { get; set; } = "";
    }
}
