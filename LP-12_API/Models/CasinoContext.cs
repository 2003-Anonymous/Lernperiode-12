using Microsoft.EntityFrameworkCore;

namespace LP_12_API.Models
{
    public class CasinoContext : DbContext
    {
        public CasinoContext(DbContextOptions<CasinoContext> options) : base(options) { }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            modelBuilder.Seed();
        }

        public DbSet<Account> Accounts => Set<Account>();
    }
}