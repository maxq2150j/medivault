namespace MediVault.Backend.Models
{
    public class PatientFile
    {
        public int Id { get; set; }
        public int PatientId { get; set; }
        public Patient? Patient { get; set; }
        public int? DoctorId { get; set; }
        public Doctor? Doctor { get; set; }
        public string FileName { get; set; } = string.Empty;
        public string FilePath { get; set; } = string.Empty;
        public string FileType { get; set; } = string.Empty; // e.g., "X-Ray", "Blood Test", "Prescription"
        public long FileSize { get; set; }
        public DateTime UploadedAt { get; set; } = DateTime.Now;
        public int? UploadedByHospitalId { get; set; }
        public Hospital? UploadedByHospital { get; set; }
        public string? Description { get; set; }
    }
}
