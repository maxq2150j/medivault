using System.Security.Cryptography;
using System.Text;
using System.Text.Json;
using System.Net.Http.Headers;

namespace MediVault.Backend.Services
{
    public class PaymentService
    {
        private readonly IConfiguration _configuration;
        private readonly HttpClient _httpClient;
        private const string RazorpayBaseUrl = "https://api.razorpay.com/v1";

        // Razorpay Test Credentials
        private const string RazorpayKeyId = "rzp_test_RxnUCrgLa64UMx"; // Test Key ID
        private const string RazorpayKeySecret = "hsBKVV56OSGLtjg83DzAE0on"; // Test Key Secret

        public PaymentService(IConfiguration configuration)
        {
            _configuration = configuration;
            _httpClient = new HttpClient();
            var credentials = Convert.ToBase64String(Encoding.ASCII.GetBytes($"{RazorpayKeyId}:{RazorpayKeySecret}"));
            _httpClient.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Basic", credentials);
        }

        public async Task<(bool Success, string OrderId, string Error)> CreateOrderAsync(decimal amount, string appointmentId, string patientEmail, string patientPhone)
        {
            try
            {
                var parameters = new Dictionary<string, string>
                {
                    { "amount", ((int)(amount * 100)).ToString() },
                    { "currency", "INR" },
                    { "receipt", $"appointment_{appointmentId}" },
                    { "notes[appointment_id]", appointmentId },
                    { "notes[patient_email]", patientEmail },
                    { "notes[patient_phone]", patientPhone }
                };

                var content = new FormUrlEncodedContent(parameters);
                var response = await _httpClient.PostAsync($"{RazorpayBaseUrl}/orders", content);

                if (!response.IsSuccessStatusCode)
                {
                    var errorContent = await response.Content.ReadAsStringAsync();
                    return (false, "", $"Failed to create order: {errorContent}");
                }

                var responseContent = await response.Content.ReadAsStringAsync();
                var jsonResponse = JsonSerializer.Deserialize<JsonElement>(responseContent);
                var orderId = jsonResponse.GetProperty("id").GetString() ?? "";

                return (true, orderId, "");
            }
            catch (Exception ex)
            {
                return (false, "", $"Exception: {ex.Message}");
            }
        }

        public async Task<(bool Success, string PaymentId, string Error)> GetPaymentDetailsAsync(string paymentId)
        {
            try
            {
                var response = await _httpClient.GetAsync($"{RazorpayBaseUrl}/payments/{paymentId}");

                if (!response.IsSuccessStatusCode)
                {
                    var errorContent = await response.Content.ReadAsStringAsync();
                    return (false, "", $"Failed to fetch payment: {errorContent}");
                }

                var responseContent = await response.Content.ReadAsStringAsync();
                var jsonResponse = JsonSerializer.Deserialize<JsonElement>(responseContent);
                var status = jsonResponse.GetProperty("status").GetString();

                return (status == "captured", paymentId, "");
            }
            catch (Exception ex)
            {
                return (false, "", $"Exception: {ex.Message}");
            }
        }

        public bool VerifyPaymentSignature(string orderId, string paymentId, string signature)
        {
            try
            {
                var message = $"{orderId}|{paymentId}";
                var key = RazorpayKeySecret;
                var encoding = new UTF8Encoding();
                var keyBytes = encoding.GetBytes(key);
                var messageBytes = encoding.GetBytes(message);

                using (var hmacsha256 = new HMACSHA256(keyBytes))
                {
                    var hashMessage = hmacsha256.ComputeHash(messageBytes);
                    var computedSignature = Convert.ToHexString(hashMessage).ToLower();
                    return computedSignature == signature.ToLower();
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Signature verification error: {ex.Message}");
                return false;
            }
        }

        public string GetRazorpayKeyId()
        {
            return RazorpayKeyId;
        }
    }
}
