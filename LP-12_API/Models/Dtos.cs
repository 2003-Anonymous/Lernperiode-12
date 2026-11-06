using System.ComponentModel.DataAnnotations;
using System.Text;

namespace LP_12_API.Models
{
    public record LoginRequest(string Username, string Password);

    public sealed class RegisterRequest : IValidatableObject
    {
        public RegisterRequest() { }

        public RegisterRequest(string username, string password)
        {
            Username = username;
            Password = password;
        }

        [Required, StringLength(30, MinimumLength = 3),
         RegularExpression(@"\A[A-Za-z0-9._-]+\z")]
        public string Username { get; init; } = string.Empty;

        [Required, StringLength(72, MinimumLength = 8)]
        public string Password { get; init; } = string.Empty;

        public IEnumerable<ValidationResult> Validate(ValidationContext validationContext)
        {
            if (Password is not null && Encoding.UTF8.GetByteCount(Password) > 72)
            {
                yield return new ValidationResult(
                    "Das Passwort darf maximal 72 UTF-8-Bytes enthalten.",
                    new[] { nameof(Password) });
            }
        }
    }

    public record BalanceChangeRequest(
        [Range(-1_000_000, 1_000_000)] double Amount);

    public record AccountDto(int Id, string Username, string Role, double Balance);
}