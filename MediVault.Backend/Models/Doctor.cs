namespace MediVault.Backend.Models
{
    public class Doctor
    {
        public int Id { get; set; }
        public int UserId { get; set; }
        public int HospitalId { get; set; }
        public string Name { get; set; } = "";
        public string Specialization { get; set; } = "";
        public string LicenseNumber { get; set; } = "";
        public string PhoneNumber { get; set; } = "";
        public string? ProfilePicture { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public bool IsActive { get; set; } = true;

        // Navigation properties
        public User? User { get; set; }
        public Hospital? Hospital { get; set; }
        public ICollection<Appointment> Appointments { get; set; } = new List<Appointment>();
        public ICollection<DoctorAccessRequest> AccessRequests { get; set; } = new List<DoctorAccessRequest>();
    }
}
