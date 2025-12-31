using MediVault.Backend.Models;
using Microsoft.EntityFrameworkCore;

namespace MediVault.Backend.Data
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

        public DbSet<User> Users { get; set; }
        public DbSet<Patient> Patients { get; set; }
        public DbSet<Hospital> Hospitals { get; set; }
        public DbSet<Admin> Admins { get; set; }
        public DbSet<Doctor> Doctors { get; set; }
        public DbSet<Consultation> Consultations { get; set; }
        public DbSet<Appointment> Appointments { get; set; }
        public DbSet<Payment> Payments { get; set; }
        public DbSet<DoctorAccessRequest> DoctorAccessRequests { get; set; }
        public DbSet<OtpRecord> OtpRecords { get; set; }
        public DbSet<PatientFile> PatientFiles { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);
            
            // Relationships
            modelBuilder.Entity<Patient>()
                .HasOne(p => p.User)
                .WithOne()
                .HasForeignKey<Patient>(p => p.UserId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<Hospital>()
                .HasOne(h => h.User)
                .WithOne()
                .HasForeignKey<Hospital>(h => h.UserId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<Admin>()
                .HasOne(a => a.User)
                .WithOne()
                .HasForeignKey<Admin>(a => a.UserId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<Doctor>()
                .HasOne(d => d.User)
                .WithOne()
                .HasForeignKey<Doctor>(d => d.UserId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<Doctor>()
                .HasOne(d => d.Hospital)
                .WithMany(h => h.Doctors)
                .HasForeignKey(d => d.HospitalId)
                .OnDelete(DeleteBehavior.Cascade);
                
            modelBuilder.Entity<Consultation>()
                .HasOne(c => c.Patient)
                .WithMany(p => p.Consultations)
                .HasForeignKey(c => c.PatientId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<Consultation>()
                .HasOne(c => c.Hospital)
                .WithMany(h => h.Consultations)
                .HasForeignKey(c => c.HospitalId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<Consultation>()
                .HasOne(c => c.Doctor)
                .WithMany()
                .HasForeignKey(c => c.DoctorId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<PatientFile>()
                .HasOne(f => f.Patient)
                .WithMany(p => p.PatientFiles)
                .HasForeignKey(f => f.PatientId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<PatientFile>()
                .HasOne(f => f.Doctor)
                .WithMany()
                .HasForeignKey(f => f.DoctorId)
                .OnDelete(DeleteBehavior.SetNull);

            modelBuilder.Entity<PatientFile>()
                .HasOne(f => f.UploadedByHospital)
                .WithMany(h => h.PatientFiles)
                .HasForeignKey(f => f.UploadedByHospitalId)
                .OnDelete(DeleteBehavior.SetNull);

            modelBuilder.Entity<Appointment>()
                .HasOne(a => a.Patient)
                .WithMany(p => p.Appointments)
                .HasForeignKey(a => a.PatientId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<Appointment>()
                .HasOne(a => a.Doctor)
                .WithMany(d => d.Appointments)
                .HasForeignKey(a => a.DoctorId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<DoctorAccessRequest>()
                .HasOne(ar => ar.Doctor)
                .WithMany(d => d.AccessRequests)
                .HasForeignKey(ar => ar.DoctorId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<DoctorAccessRequest>()
                .HasOne(ar => ar.Patient)
                .WithMany()
                .HasForeignKey(ar => ar.PatientId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<DoctorAccessRequest>()
                .HasOne(ar => ar.Appointment)
                .WithOne(a => a.AccessRequest)
                .HasForeignKey<DoctorAccessRequest>(ar => ar.AppointmentId)
                .OnDelete(DeleteBehavior.SetNull);

            modelBuilder.Entity<Payment>()
                .HasOne(p => p.Appointment)
                .WithOne(a => a.Payment)
                .HasForeignKey<Payment>(p => p.AppointmentId)
                .OnDelete(DeleteBehavior.Cascade);
        }
    }
}

