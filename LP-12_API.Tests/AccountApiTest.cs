using System.Net;
using System.Net.Http.Json;

using LP_12_API.Models;

namespace LP_12_API.Tests;

[Trait("Category", "Integration")]
public class AccountApiTests : IClassFixture<CasinoApiFactory>
{
    private readonly CasinoApiFactory _factory;

    public AccountApiTests(CasinoApiFactory factory) => _factory = factory;

    private async Task<HttpClient> LoginAsync(string username, string password)
    {
        var client = _factory.CreateClient();
        var response = await client.PostAsJsonAsync("/Account/login", new LoginRequest(username, password));
        response.EnsureSuccessStatusCode();
        return client;
    }

    [Fact] // #12
    public async Task Health_DatenbankErreichbar_Gibt200Healthy()
    {
        var response = await _factory.CreateClient().GetAsync("/health");

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        Assert.Equal("Healthy", await response.Content.ReadAsStringAsync());
    }

    [Fact] // #13, #16
    public async Task Login_RichtigesPasswort_Gibt200OhnePasswort()
    {
        var response = await _factory.CreateClient()
            .PostAsJsonAsync("/Account/login", new LoginRequest("user", "user123"));
        var body = await response.Content.ReadAsStringAsync();

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        Assert.DoesNotContain("password", body, StringComparison.OrdinalIgnoreCase);
        Assert.DoesNotContain("$2", body);
    }

    [Fact] // #13
    public async Task Login_FalschesPasswort_Gibt401()
    {
        var response = await _factory.CreateClient()
            .PostAsJsonAsync("/Account/login", new LoginRequest("user", "falsch"));

        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
    }

    [Fact] // #14
    public async Task Me_OhneLogin_Gibt401()
    {
        var response = await _factory.CreateClient().GetAsync("/Account/me");

        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
    }

    [Fact] // #14
    public async Task Me_NachLogin_GibtEigenesKontoMitGuthaben()
    {
        var client = await LoginAsync("user", "user123");

        var me = await client.GetFromJsonAsync<AccountDto>("/Account/me");

        Assert.Equal("user", me!.Username);
        Assert.Equal(500, me.Balance);
    }

    [Fact] // #16
    public async Task Register_NeuerName_Gibt201AlsUserMitStartguthaben()
    {
        var name = "test_" + Guid.NewGuid().ToString("N")[..8];

        var response = await _factory.CreateClient()
            .PostAsJsonAsync("/Account/register", new RegisterRequest(name, "geheim123"));
        var account = await response.Content.ReadFromJsonAsync<AccountDto>();

        Assert.Equal(HttpStatusCode.Created, response.StatusCode);
        Assert.Equal("User", account!.Role);
        Assert.Equal(1000, account.Balance);
    }

    [Fact] // #16
    public async Task Register_NameVergeben_Gibt409()
    {
        var response = await _factory.CreateClient()
            .PostAsJsonAsync("/Account/register", new RegisterRequest("user", "geheim123"));

        Assert.Equal(HttpStatusCode.Conflict, response.StatusCode);
    }

    [Fact] // #16
    public async Task AlleKonten_AlsUser_Gibt403()
    {
        var client = await LoginAsync("user", "user123");

        var response = await client.GetAsync("/Account");

        Assert.Equal(HttpStatusCode.Forbidden, response.StatusCode);
    }

    [Fact] // #16
    public async Task AlleKonten_AlsAdmin_Gibt200OhnePasswoerter()
    {
        var client = await LoginAsync("admin", "admin123");

        var response = await client.GetAsync("/Account");
        var body = await response.Content.ReadAsStringAsync();

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        Assert.DoesNotContain("$2", body);
    }

    [Fact] // #13
    public async Task Logout_DanachMe_Gibt401()
    {
        var client = await LoginAsync("user", "user123");

        await client.PostAsync("/Account/logout", null);
        var response = await client.GetAsync("/Account/me");

        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
    }
}