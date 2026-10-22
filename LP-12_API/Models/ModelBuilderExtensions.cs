using Microsoft.EntityFrameworkCore;

namespace LP_12_API.Models
{
    public static class ModelBuilderExtensions
    {
        public static void Seed(this ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<Account>().HasData(
                new Account { Id = 1, Username = "admin", Password = "admin123", Role = "Admin" },
                new Account { Id = 2, Username = "user", Password = "user123", Role = "User" }
            );
        }
    }
}
