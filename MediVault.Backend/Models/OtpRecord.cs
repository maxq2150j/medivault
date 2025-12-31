namespace MediVault.Backend.Models
{
    public class OtpRecord
    {
        public int Id { get; set; }
        public int PatientId { get; set; }
        public string Code { get; set; } = string.Empty;
        public DateTime Expiry { get; set; }
        public bool IsUsed { get; set; } = false;
        public int? RequestedByHospitalId { get; set; }
    }
}
