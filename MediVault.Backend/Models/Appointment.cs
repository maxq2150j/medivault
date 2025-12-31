namespace MediVault.Backend.Models
{
    public class Appointment
    {
        public int Id { get; set; }
        public int PatientId { get; set; }
        public int DoctorId { get; set; }
        public DateTime AppointmentDate { get; set; }
        public string Status { get; set; } = "Scheduled"; // Scheduled, Completed, Cancelled, Approved, Denied
        public string? Notes { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        
        // Payment fields
        public bool PaymentRequired { get; set; } = false;
        public decimal? PaymentAmount { get; set; }
        public string PaymentStatus { get; set; } = "NotRequested"; // NotRequested, Pending, Completed, Failed

        // Navigation properties
        public Patient? Patient { get; set; }
        public Doctor? Doctor { get; set; }
        public DoctorAccessRequest? AccessRequest { get; set; }
        public Payment? Payment { get; set; }
    }
}
