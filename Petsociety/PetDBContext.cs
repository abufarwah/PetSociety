using Microsoft.EntityFrameworkCore;
using Petsociety.Models;

namespace Petsociety.Model
{
    public class PetDbContext : DbContext
    {
        public PetDbContext(DbContextOptions<PetDbContext> options) : base(options)
        {
        }

        // existing domain sets
        public DbSet<Pet> Pets { get; set; } = null!;
        public DbSet<AdoptionRequest> AdoptionRequests { get; set; } = null!;
        public DbSet<User> Users { get; set; } = null!;
        public DbSet<Subscription> Subscriptions { get; set; } = null!;
        
        // Community feature
        public DbSet<CommunityChannel> CommunityChannels { get; set; } = null!;
        public DbSet<CommunityMessage> CommunityMessages { get; set; } = null!;

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

            // optional: indexes for queries
            modelBuilder.Entity<CommunityChannel>()
                .HasIndex(c => c.Name);

            modelBuilder.Entity<CommunityMessage>()
                .HasIndex(m => m.ChannelId);
        }
    }
}