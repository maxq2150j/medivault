using MediVault.Backend.Models;

namespace MediVault.Backend.Services
{
    public class PdfService
    {
        private readonly IWebHostEnvironment _env;

        public PdfService(IWebHostEnvironment env)
        {
            _env = env;
        }

        public string GenerateConsultationPdf(Consultation consultation, Patient patient, Hospital hospital)
        {
            try
            {
                var reportsFolder = Path.Combine(_env.WebRootPath ?? Path.Combine(Directory.GetCurrentDirectory(), "wwwroot"), "reports");
                if (!Directory.Exists(reportsFolder)) Directory.CreateDirectory(reportsFolder);

                var fileName = $"consultation_{consultation.Id}_{DateTime.Now.Ticks}.txt";
                var filePath = Path.Combine(reportsFolder, fileName);

                // Create a simple text file as placeholder since iText requires license
                var textContent = $@"
CONSULTATION REPORT
==================

Hospital: {hospital?.Name ?? "N/A"}
Address: {hospital?.Address ?? "N/A"}

Patient Name: {patient?.Name ?? "N/A"}
Age: {patient?.Age ?? 0}
Gender: {patient?.Gender ?? "N/A"}

Date: {consultation.Date:g}

VITALS
------
BP: {consultation.BP ?? "N/A"}
Sugar: {consultation.Sugar ?? "N/A"}
Temperature: {consultation.Temperature ?? "N/A"}

DIAGNOSIS
---------
{consultation.Diagnosis ?? "N/A"}

MEDICINES
---------
{consultation.Medicines ?? "N/A"}

Report Generated: {DateTime.Now:g}
";

                System.IO.File.WriteAllText(filePath, textContent);
                Console.WriteLine($"[PdfService] Consultation report saved as text file: {filePath}");
                
                return $"/reports/{fileName}";
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[PdfService] Error generating report: {ex.Message}");
                throw;
            }
        }
    }
}
