using MediVault.Backend.Data;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using System.Security.Claims;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.

builder.Services.AddControllers();
// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// Services
builder.Services.AddScoped<MediVault.Backend.Services.PdfService>();
builder.Services.AddScoped<MediVault.Backend.Services.EmailService>();
builder.Services.AddScoped<MediVault.Backend.Services.PaymentService>();

// DB Context
var connectionString = builder.Configuration.GetConnectionString("DefaultConnection") ?? "Server=localhost;Database=MediVault;User=root;Password=;Port=3306;";
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseMySql(connectionString, ServerVersion.AutoDetect(connectionString)));

// CORS
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowReactApp",
        b => b.WithOrigins("http://localhost:5173", "http://localhost:5174", "http://localhost:5175", "http://localhost:5176") // Vite default and all fallback ports
              .AllowAnyMethod()
              .AllowAnyHeader());
});

// Authentication
var jwtKey = builder.Configuration["Jwt:Key"] ?? "ThisIsASecretKeyForMediVaultApp123!";
var key = Encoding.ASCII.GetBytes(jwtKey);

builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.RequireHttpsMetadata = false;
    options.SaveToken = true;
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuerSigningKey = true,
        IssuerSigningKey = new SymmetricSecurityKey(key),
        ValidateIssuer = false,
        ValidateAudience = false
    };
});

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseCors("AllowReactApp");

app.UseStaticFiles(); // Enable serving PDF reports from wwwroot

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

// Auto-migration / DB Init
using (var scope = app.Services.CreateScope())
{
    var services = scope.ServiceProvider;
    try 
    {
        var db = services.GetRequiredService<AppDbContext>();
        db.Database.EnsureCreated(); // Creates DB if not exists (including tables)
        
        // Seed Admin if not exists
        if (!db.Users.Any(u => u.Role == "Admin"))
        {
            var adminUser = new MediVault.Backend.Models.User 
            { 
                Username = "admin", 
                PasswordHash = "Admin@123",
                Role = "Admin", 
                Email = "admin@medivault.com" 
            };
            db.Users.Add(adminUser);
            db.SaveChanges();
            
            db.Admins.Add(new MediVault.Backend.Models.Admin 
            { 
                UserId = adminUser.Id, 
                Name = "Super Admin" 
            });
            db.SaveChanges();
        }
    }
    catch (Exception ex)
    {
        var logger = services.GetRequiredService<ILogger<Program>>();
        logger.LogError(ex, "An error occurred creating the DB.");
    }
}

app.Run();
