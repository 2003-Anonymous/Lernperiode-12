namespace LP_12_API.Models
{
    public record LoginRequest(string Username, string Password);
    public record AccountDto(int Id, string Username, string Role, double Balance);
}