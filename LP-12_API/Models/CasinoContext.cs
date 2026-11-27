using Microsoft.EntityFrameworkCore;

namespace LP_12_API.Models
{
    public class CasinoContext : DbContext
    {
        public CasinoContext(DbContextOptions<CasinoContext> options) : base(options) { }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            modelBuilder.Seed();
            modelBuilder.Entity<RedeemCode>().HasIndex(c => c.Code).IsUnique();
            modelBuilder.Entity<CodeRedemption>().HasIndex(r => new { r.AccountId, r.RedeemCodeId }).IsUnique();
        }

        public DbSet<Account> Accounts => Set<Account>();
        public DbSet<RedeemCode> RedeemCodes => Set<RedeemCode>();
        public DbSet<CodeRedemption> CodeRedemptions => Set<CodeRedemption>();
    }
}