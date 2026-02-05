using System.ComponentModel.DataAnnotations.Schema;

namespace MediVault.Backend.Models
{
    public class Consultation
    {
        public int Id { get; set; }
        
        public int PatientId { get; set; }
        public Patient? Patient { get; set; }
        
        public int DoctorId { get; set; }
        public Doctor? Doctor { get; set; }
        
        public int HospitalId { get; set; }
        public Hospital? Hospital { get; set; }
        
        public DateTime Date { get; set; } = DateTime.Now;
        public string Diagnosis { get; set; } = string.Empty;
        
        // Vitals
        public string BP { get; set; } = string.Empty;
        public string Sugar { get; set; } = string.Empty;
        public string Temperature { get; set; } = string.Empty;
        
        // JSON string for medicines: [{ "name": "...", "dosage": "...", "frequency": "..." }]
        public string Medicines { get; set; } = "[]"; 

        public string PdfPath { get; set; } = string.Empty;
    }
}
