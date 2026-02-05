namespace MediVault.Backend.Models
{
    public class Hospital
    {
        public int Id { get; set; }
        public int UserId { get; set; }
        public User? User { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Address { get; set; } = string.Empty;
        public string ContactNumber { get; set; } = string.Empty;
        public bool IsActive { get; set; } = true;
        
        // Navigation for consultations created by this hospital
        public ICollection<Consultation> Consultations { get; set; } = new List<Consultation>();
        
        // Navigation for files uploaded by this hospital
        public ICollection<PatientFile> PatientFiles { get; set; } = new List<PatientFile>();
        
        // Navigation for doctors in this hospital
        public ICollection<Doctor> Doctors { get; set; } = new List<Doctor>();
    }
}
