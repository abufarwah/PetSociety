using Microsoft.EntityFrameworkCore;
using Petsociety.Model;    // LostFoundReport, LostFoundReportType enum, enums
using Petsociety.Models;   // Pet, User, AdoptionRequest, Subscription, Payment

namespace Petsociety.Model
{
    public class PetDbContext : DbContext
    {
        public PetDbContext(DbContextOptions<PetDbContext> options) : base(options)
        {
        }

        // ── Core domain sets ─────────────────────────────────────────────────
        public DbSet<Pet> Pets { get; set; } = null!;
        public DbSet<AdoptionRequest> AdoptionRequests { get; set; } = null!;
        public DbSet<User> Users { get; set; } = null!;
        public DbSet<Subscription> Subscriptions { get; set; } = null!;
        public DbSet<Payment> Payments { get; set; } = null!;

        // ── Lost & Found (unified entity — Petsociety.Model namespace) ───────
        public DbSet<LostFoundReport> LostFoundReports { get; set; } = null!;

        // ── Community feature ─────────────────────────────────────────────────
        public DbSet<CommunityChannel> CommunityChannels { get; set; } = null!;
        public DbSet<CommunityMessage> CommunityMessages { get; set; } = null!;
        public DbSet<CommunityMember> CommunityMembers { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            modelBuilder.Entity<CommunityChannel>()
                .HasMany(c => c.Messages)
                .WithOne(m => m.Channel)
                .HasForeignKey(m => m.ChannelId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<CommunityMessage>()
                .HasOne(m => m.User)
                .WithMany()
                .HasForeignKey(m => m.UserId)
                .OnDelete(DeleteBehavior.Restrict);

            // Optional: indexes for common queries
            modelBuilder.Entity<CommunityChannel>()
                .HasIndex(c => c.Name);

            modelBuilder.Entity<CommunityMessage>()
                .HasIndex(m => m.ChannelId);

            modelBuilder.Entity<User>().HasData(
    new User
    {
        Id = 1,
        FullName = "Admin",
        Email = "admin@gmail.com",
        Phone = "000",
        //PasswordHash = BCrypt.Net.BCrypt.HashPassword("Admin@123"),
        PasswordHash = "$2a$11$mQ4C6CANn5zxz4gqw5ldlu6jnpDBvuTe8i0K0rI2w8owp6UFE46cq", // Pre-hashed password for "Admin@123"
        Role = "Admin",
        IsActive = true,
        IsDeleted = false
    }
);
            modelBuilder.Entity<CommunityMember>()
    .HasOne(x => x.Channel)
    .WithMany()
    .HasForeignKey(x => x.ChannelId);

            modelBuilder.Entity<CommunityMember>()
                .HasOne(x => x.User)
                .WithMany()
                .HasForeignKey(x => x.UserId);
        }

    }
}