using Microsoft.EntityFrameworkCore;

namespace Petsociety.Model
{
    public class PetDbContext : DbContext
    {
        public PetDbContext(DbContextOptions<PetDbContext> options) : base(options)
        {
        }

        // keep existing DbSets in your project; add these if not present
        public DbSet<Pet> Pets { get; set; } = null!;
        public DbSet<AdoptionRequest> AdoptionRequests { get; set; } = null!;
    }
}