using Microsoft.EntityFrameworkCore;

namespace LP_12_API.Models
{
    public static class ModelBuilderExtensions
    {
        public static void Seed(this ModelBuilder modelBuilder)
        {
            // Passwörter als BCrypt-Hash (Klartext: admin123 / user123)
            modelBuilder.Entity<Account>().HasData(
                new Account { Id = 1, Username = "admin", Password = "$2a$11$R0BhPmNawBurV65kJ.ifcuplSmzBEhrOgbVw0tTy1fHSSkubuaaXe", Role = "Admin", Balance = 1000.0 },
                new Account { Id = 2, Username = "user", Password = "$2a$11$CUwp5Twv7sUpLYDSrdy2ceUJ/yBWE1CoUjhCA6DzXxtkU.e5LvG7S", Role = "User", Balance = 500.0 }
            );
        }
    }
}