namespace MediVault.Backend.Models
{
    public class DoctorAccessRequest
    {
        public int Id { get; set; }
        public int DoctorId { get; set; }
        public int PatientId { get; set; }
        public int? AppointmentId { get; set; }
        public string OTP { get; set; } = "";
        public bool IsVerified { get; set; } = false;
        public DateTime OTPSentAt { get; set; } = DateTime.UtcNow;
        public DateTime? VerifiedAt { get; set; }
        public DateTime? AccessExpiresAt { get; set; } // 10 minutes from verification
        public string Status { get; set; } = "Pending"; // Pending, Verified, Expired, Cancelled
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        // Navigation properties
        public Doctor? Doctor { get; set; }
        public Patient? Patient { get; set; }
        public Appointment? Appointment { get; set; }
    }
}
