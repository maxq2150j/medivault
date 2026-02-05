
using iTextSharp.text;
using iTextSharp.text.pdf;
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

                var fileName = $"consultation_{consultation.Id}_{DateTime.Now.Ticks}.pdf";
                var filePath = Path.Combine(reportsFolder, fileName);

                // Generate PDF using iText (classic)
                using (var fs = new FileStream(filePath, FileMode.Create, FileAccess.Write, FileShare.None))
                {
                    var doc = new Document(PageSize.A4);
                    var writer = PdfWriter.GetInstance(doc, fs);
                    doc.Open();

                    // Try to add a centered, low-opacity watermark image behind the content.
                    try
                    {
                        var webRoot = _env.WebRootPath ?? Path.Combine(Directory.GetCurrentDirectory(), "wwwroot");
                        var candidates = new[] {
                            Path.Combine(webRoot, "logo.png"),
                            Path.Combine(webRoot, "assets", "logo.png"),
                            Path.Combine(webRoot, "images", "logo.png"),
                            Path.Combine(webRoot, "logo.jpg"),
                            Path.Combine(webRoot, "assets", "logo.jpg"),
                            // also check uploads where you may have manually placed the logo
                            Path.Combine(webRoot, "uploads", "logo.png"),
                            Path.Combine(webRoot, "uploads", "logo.jpg")
                        };

                        string logoPath = candidates.FirstOrDefault(File.Exists);
                        // If no exact candidate found, try scanning uploads for likely image files
                        if (string.IsNullOrEmpty(logoPath))
                        {
                            try
                            {
                                var uploadsDir = Path.Combine(webRoot, "uploads");
                                if (Directory.Exists(uploadsDir))
                                {
                                    var files = Directory.GetFiles(uploadsDir, "*.png").Concat(Directory.GetFiles(uploadsDir, "*.jpg")).ToList();
                                    // prefer filenames containing "logo" or "shield"
                                    var preferred = files.FirstOrDefault(f => Path.GetFileName(f).ToLower().Contains("logo") || Path.GetFileName(f).ToLower().Contains("shield"));
                                    logoPath = preferred ?? files.FirstOrDefault();
                                }
                            }
                            catch (Exception scanEx)
                            {
                                Console.WriteLine($"[PdfService] Uploads scan error: {scanEx.Message}");
                            }
                        }
                        var under = writer.DirectContentUnder;
                        if (!string.IsNullOrEmpty(logoPath))
                        {
                            try
                            {
                                var img = Image.GetInstance(logoPath);
                                // scale image to fit roughly half page width
                                var maxWidth = doc.PageSize.Width * 0.6f;
                                var maxHeight = doc.PageSize.Height * 0.6f;
                                img.ScaleToFit(maxWidth, maxHeight);
                                var x = (doc.PageSize.Width - img.ScaledWidth) / 2f;
                                var y = (doc.PageSize.Height - img.ScaledHeight) / 2f;
                                img.SetAbsolutePosition(x, y);

                                var gs = new PdfGState { FillOpacity = 0.15f, StrokeOpacity = 0.15f };
                                under.SaveState();
                                under.SetGState(gs);
                                under.AddImage(img);
                                under.RestoreState();
                            }
                            catch (Exception innerImgEx)
                            {
                                Console.WriteLine($"[PdfService] Failed to render logo image: {innerImgEx.Message}");
                                // fall through to text watermark below
                            }
                        }

                        // If image not available or failed, add a centered faint text watermark as fallback
                        // If image watermark is not available, do not add a text watermark.
                        // This keeps the report clean and relies only on the image watermark when present.
                    }
                    catch (Exception imgEx)
                    {
                        Console.WriteLine($"[PdfService] Watermark image error: {imgEx.Message}");
                        // Continue without watermark
                    }

                    var titleFont = FontFactory.GetFont(FontFactory.HELVETICA_BOLD, 16);
                    var sectionFont = FontFactory.GetFont(FontFactory.HELVETICA_BOLD, 12);
                    var normalFont = FontFactory.GetFont(FontFactory.HELVETICA, 11);

                    var headerFont = FontFactory.GetFont(FontFactory.HELVETICA_BOLD, 20, new BaseColor(10, 94, 175));
                    var hospitalFont = FontFactory.GetFont(FontFactory.HELVETICA_BOLD, 14, new BaseColor(80, 80, 80));
                    var labelFont = FontFactory.GetFont(FontFactory.HELVETICA_BOLD, 11);

                    // Header
                    var headerTable = new PdfPTable(2) { WidthPercentage = 100 };
                    headerTable.SetWidths(new float[] { 70f, 30f });
                    var medivaultCell = new PdfPCell(new Phrase("MediVault", headerFont)) { Border = Rectangle.NO_BORDER, HorizontalAlignment = Element.ALIGN_LEFT };
                    var hospitalCell = new PdfPCell(new Phrase(hospital?.Name ?? "Hospital", hospitalFont)) { Border = Rectangle.NO_BORDER, HorizontalAlignment = Element.ALIGN_RIGHT };
                    headerTable.AddCell(medivaultCell);
                    headerTable.AddCell(hospitalCell);
                    doc.Add(headerTable);

                    doc.Add(new Paragraph(" ")); // spacer

                    // Boxed content container using a 1-column table
                    var container = new PdfPTable(1) { WidthPercentage = 100, SpacingBefore = 4f, SpacingAfter = 4f };
                    var containerCell = new PdfPCell() { Border = Rectangle.BOX, Padding = 12f };

                    // Inside container: patient details table
                    var patientTable = new PdfPTable(4) { WidthPercentage = 100, SpacingAfter = 8f };
                    patientTable.SetWidths(new float[] { 20f, 30f, 20f, 30f });
                    patientTable.AddCell(new PdfPCell(new Phrase("Patient Name", labelFont)) { Border = Rectangle.NO_BORDER });
                    patientTable.AddCell(new PdfPCell(new Phrase(patient?.Name ?? "N/A", normalFont)) { Border = Rectangle.NO_BORDER });
                    patientTable.AddCell(new PdfPCell(new Phrase("Age", labelFont)) { Border = Rectangle.NO_BORDER });
                    patientTable.AddCell(new PdfPCell(new Phrase((patient?.Age ?? 0).ToString(), normalFont)) { Border = Rectangle.NO_BORDER });

                    patientTable.AddCell(new PdfPCell(new Phrase("Gender", labelFont)) { Border = Rectangle.NO_BORDER });
                    patientTable.AddCell(new PdfPCell(new Phrase(patient?.Gender ?? "N/A", normalFont)) { Border = Rectangle.NO_BORDER });
                    patientTable.AddCell(new PdfPCell(new Phrase("Date", labelFont)) { Border = Rectangle.NO_BORDER });
                    patientTable.AddCell(new PdfPCell(new Phrase(consultation.Date.ToString("g"), normalFont)) { Border = Rectangle.NO_BORDER });

                    // Vitals table
                    var vitalsHeader = new PdfPTable(1) { WidthPercentage = 100, SpacingBefore = 6f };
                    vitalsHeader.AddCell(new PdfPCell(new Phrase("VITAL SIGNS", sectionFont)) { Border = Rectangle.NO_BORDER });

                    var vitalsTable = new PdfPTable(3) { WidthPercentage = 100, SpacingAfter = 8f };
                    vitalsTable.SetWidths(new float[] { 33f, 33f, 34f });
                    vitalsTable.AddCell(new PdfPCell(new Phrase("Blood Pressure", labelFont)) { HorizontalAlignment = Element.ALIGN_LEFT, Padding = 6f });
                    vitalsTable.AddCell(new PdfPCell(new Phrase("Sugar", labelFont)) { HorizontalAlignment = Element.ALIGN_LEFT, Padding = 6f });
                    vitalsTable.AddCell(new PdfPCell(new Phrase("Temperature", labelFont)) { HorizontalAlignment = Element.ALIGN_LEFT, Padding = 6f });

                    vitalsTable.AddCell(new PdfPCell(new Phrase(consultation.BP ?? "N/A", normalFont)) { Padding = 6f });
                    vitalsTable.AddCell(new PdfPCell(new Phrase(consultation.Sugar ?? "N/A", normalFont)) { Padding = 6f });
                    vitalsTable.AddCell(new PdfPCell(new Phrase(consultation.Temperature ?? "N/A", normalFont)) { Padding = 6f });

                    // Diagnosis
                    var diagHeader = new PdfPCell(new Phrase("DIAGNOSIS", sectionFont)) { Border = Rectangle.NO_BORDER, PaddingTop = 6f };
                    var diagCell = new PdfPCell(new Phrase(consultation.Diagnosis ?? "N/A", normalFont)) { Colspan = 4, Padding = 8f };

                    // Medicines
                    var medsHeader = new PdfPCell(new Phrase("MEDICINES", sectionFont)) { Border = Rectangle.NO_BORDER, PaddingTop = 6f };
                    var medsCell = new PdfPCell(new Phrase(consultation.Medicines ?? "N/A", normalFont)) { Colspan = 4, Padding = 8f };

                    // Assemble inner content into a single table to add into container cell
                    var inner = new PdfPTable(1) { WidthPercentage = 100 };
                    inner.AddCell(new PdfPCell(patientTable) { Border = Rectangle.NO_BORDER, Padding = 0f });
                    inner.AddCell(new PdfPCell(vitalsHeader) { Border = Rectangle.NO_BORDER, Padding = 0f });
                    inner.AddCell(new PdfPCell(vitalsTable) { Border = Rectangle.NO_BORDER, Padding = 0f });
                    inner.AddCell(diagHeader);
                    inner.AddCell(diagCell);
                    inner.AddCell(medsHeader);
                    inner.AddCell(medsCell);

                    containerCell.AddElement(inner);
                    container.AddCell(containerCell);

                    doc.Add(container);

                    // Footer — use the consultation timestamp so the report time matches stored consultation time
                    var footerTable = new PdfPTable(1) { WidthPercentage = 100, SpacingBefore = 8f };
                    footerTable.AddCell(new PdfPCell(new Phrase($"Report Generated: {consultation.Date.ToLocalTime():g}", FontFactory.GetFont(FontFactory.HELVETICA_OBLIQUE, 9))) { Border = Rectangle.NO_BORDER, HorizontalAlignment = Element.ALIGN_RIGHT });
                    doc.Add(footerTable);

                    doc.Close();
                }
                Console.WriteLine($"[PdfService] Consultation report saved as PDF: {filePath}");
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
