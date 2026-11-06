using System.ComponentModel.DataAnnotations;

namespace LP_12_API.Models
{
    public record LoginRequest(string Username, string Password);

    public record RegisterRequest(
        [Required, MinLength(3)] string Username,
        [Required, MinLength(6)] string Password);

    public record BalanceChangeRequest(
        [Range(-1_000_000, 1_000_000)] double Amount);

    public record AccountDto(int Id, string Username, string Role, double Balance);
}