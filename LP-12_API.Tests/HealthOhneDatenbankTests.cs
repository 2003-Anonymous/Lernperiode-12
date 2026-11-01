using System.Net;

namespace LP_12_API.Tests;

[Trait("Category", "Integration")]
public class HealthOhneDatenbankTests : IClassFixture<UnreachableDbFactory>
{
    private readonly UnreachableDbFactory _factory;

    public HealthOhneDatenbankTests(UnreachableDbFactory factory) => _factory = factory;

    [Fact] // #12, Kriterium 2
    public async Task Health_DatenbankNichtErreichbar_Gibt503OhneZugangsdaten()
    {
        var response = await _factory.CreateClient().GetAsync("/health");
        var body = await response.Content.ReadAsStringAsync();

        Assert.Equal(HttpStatusCode.ServiceUnavailable, response.StatusCode);
        Assert.Equal("Unhealthy", body);
        Assert.DoesNotContain("Password", body);
    }
}