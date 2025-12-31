namespace MediVault.Backend.Models
{
    public class Payment
    {
        public int Id { get; set; }
        public int AppointmentId { get; set; }
        public decimal Amount { get; set; }
        public string PaymentStatus { get; set; } = "Pending"; // Pending, Completed, Failed, Cancelled
        public string? RazorpayOrderId { get; set; }
        public string? RazorpayPaymentId { get; set; }
        public string? RazorpaySignature { get; set; }
        public DateTime RequestedAt { get; set; } = DateTime.UtcNow;
        public DateTime? CompletedAt { get; set; }
        public string? FailureReason { get; set; }

        // Navigation properties
        public Appointment? Appointment { get; set; }
    }
}
