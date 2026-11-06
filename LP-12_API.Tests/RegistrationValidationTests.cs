using System.ComponentModel.DataAnnotations;

using LP_12_API.Models;

namespace LP_12_API.Tests;

public class RegistrationValidationTests
{
    [Theory]
    [InlineData("navid", "geheim123", true)]
    [InlineData("navid.test_1", "geheim123", true)]
    [InlineData("ab", "geheim123", false)]
    [InlineData("", "geheim123", false)]
    [InlineData("   ", "geheim123", false)]
    [InlineData("navid name", "geheim123", false)]
    [InlineData("navid\n", "geheim123", false)]
    [InlineData("navid", "kurz", false)]
    [InlineData("navid", "        ", false)]
    public void Registration_ValidatesInput(string name, string password, bool expected)
    {
        var request = new RegisterRequest(name, password);
        var results = new List<ValidationResult>();
        Assert.Equal(expected, Validator.TryValidateObject(request, new ValidationContext(request), results, true));
    }

    [Fact]
    public void Registration_RejectsMoreThan72Utf8Bytes()
    {
        var request = new RegisterRequest("navid", new string('ä', 37));
        Assert.False(Validator.TryValidateObject(request, new ValidationContext(request), new List<ValidationResult>(), true));
    }
}