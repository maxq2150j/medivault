namespace MediVault.Backend.Models
{
    public class Patient
    {
        public int Id { get; set; }
        public int UserId { get; set; }
        public User? User { get; set; }
        public string Name { get; set; } = string.Empty;
        public int Age { get; set; }
        public string Gender { get; set; } = string.Empty;
        public string PhoneNumber { get; set; } = string.Empty;
        public string BloodGroup { get; set; } = string.Empty;
        public string Allergies { get; set; } = string.Empty;
        public string FamilyHistory { get; set; } = string.Empty;
        
        // Navigation property for consultations
        public ICollection<Consultation> Consultations { get; set; } = new List<Consultation>();
        
        // Navigation property for patient files
        public ICollection<PatientFile> PatientFiles { get; set; } = new List<PatientFile>();
        
        // Navigation property for appointments
        public ICollection<Appointment> Appointments { get; set; } = new List<Appointment>();
    }
}
