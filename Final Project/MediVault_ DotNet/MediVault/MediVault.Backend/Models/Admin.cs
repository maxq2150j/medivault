namespace MediVault.Backend.Models
{
    public class Admin
    {
        public int Id { get; set; }
        public int UserId { get; set; }
        public User? User { get; set; }
        public string Name { get; set; } = string.Empty;
    }
}
