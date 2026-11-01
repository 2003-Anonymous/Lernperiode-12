using LP_12_API.Services;

namespace LP_12_API.Tests;

public class PasswordsTests
{
    [Fact]
    public void Hash_IstNichtDasPasswortSelbst()
    {
        // Arrange
        var password = "geheim123";
        // Act
        var hash = Passwords.Hash(password);
        // Assert
        Assert.NotEqual(password, hash);
        Assert.StartsWith("$2", hash);
    }

    [Fact]
    public void Verify_RichtigesPasswort_IstTrue()
    {
        var hash = Passwords.Hash("geheim123");
        Assert.True(Passwords.Verify("geheim123", hash));
    }

    [Fact]
    public void Verify_FalschesPasswort_IstFalse()
    {
        var hash = Passwords.Hash("geheim123");
        Assert.False(Passwords.Verify("falsch", hash));
    }

    [Fact]
    public void Hash_GleichesPasswortZweimal_GibtVerschiedeneHashes()
    {
        Assert.NotEqual(Passwords.Hash("geheim123"), Passwords.Hash("geheim123"));
    }
}