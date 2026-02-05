using System.Net;
using System.Net.Mail;

namespace MediVault.Backend.Services
{
    public class EmailService
    {
        private readonly IConfiguration _configuration;

        public EmailService(IConfiguration configuration)
        {
            _configuration = configuration;
        }

        public async Task SendEmailAsync(string toEmail, string subject, string body)
        {
            var host = _configuration["Smtp:Host"];
            var port = int.Parse(_configuration["Smtp:Port"] ?? "587");
            var username = _configuration["Smtp:Username"];
            var password = _configuration["Smtp:Password"];

            Console.WriteLine($"[EmailService] Attempting to send email...");
            Console.WriteLine($"[EmailService] Host: {host}, Port: {port}");
            Console.WriteLine($"[EmailService] Username: {username}");
            Console.WriteLine($"[EmailService] Password length: {password?.Length}");

            if (string.IsNullOrEmpty(host) || string.IsNullOrEmpty(username) || string.IsNullOrEmpty(password)) 
            {
                // Fallback for demo or logging if not configured
                Console.WriteLine($"[EmailService] SMTP not fully configured. Would send to {toEmail}");
                Console.WriteLine($"[EmailService] Subject: {subject}");
                Console.WriteLine($"[EmailService] Body: {body}");
                return;
            }

            try
            {
                using (var smtpClient = new SmtpClient(host, port))
                {
                    smtpClient.UseDefaultCredentials = false;
                    smtpClient.Credentials = new NetworkCredential(username, password);
                    smtpClient.EnableSsl = true;
                    smtpClient.DeliveryMethod = SmtpDeliveryMethod.Network;
                    smtpClient.Timeout = 30000; // 30 second timeout

                    using (var mailMessage = new MailMessage())
                    {
                        mailMessage.From = new MailAddress(username, "MediVault");
                        mailMessage.Subject = subject;
                        mailMessage.Body = body;
                        mailMessage.IsBodyHtml = false;
                        mailMessage.To.Add(toEmail);

                        await smtpClient.SendMailAsync(mailMessage);
                        Console.WriteLine($"[EmailService] Email sent successfully to {toEmail}");
                    }
                }
            }
            catch (Exception ex)
            {
                // Log the error and don't throw - allows the application to continue
                Console.WriteLine($"[EmailService] Failed to send email to {toEmail}");
                Console.WriteLine($"[EmailService] Error: {ex.GetType().Name}: {ex.Message}");
                if (ex.InnerException != null)
                {
                    Console.WriteLine($"[EmailService] Inner Exception: {ex.InnerException.Message}");
                }
                Console.WriteLine($"[EmailService] Email content - Subject: {subject}");
            }
        }
    }
}
