using LP_12_API.Models;

using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.DependencyInjection.Extensions;
using Microsoft.Extensions.Hosting;

namespace LP_12_API.Tests;

public class CasinoApiFactory : WebApplicationFactory<Program>
{
    protected virtual string ConnectionString =>
        Environment.GetEnvironmentVariable("TEST_DB_CONNECTION")
        ?? throw new InvalidOperationException("Umgebungsvariable TEST_DB_CONNECTION fehlt (siehe README).");

    protected virtual bool CreateDatabase => true;

    protected override void ConfigureWebHost(IWebHostBuilder builder)
    {
        builder.UseEnvironment("Testing");
        builder.ConfigureServices(services =>
        {
            services.RemoveAll<DbContextOptions<CasinoContext>>();
            services.RemoveAll<IDbContextOptionsConfiguration<CasinoContext>>();
            services.AddDbContext<CasinoContext>(o => o.UseSqlServer(ConnectionString));
        });
    }

    protected override IHost CreateHost(IHostBuilder builder)
    {
        var host = base.CreateHost(builder);
        if (CreateDatabase)
        {
            using var scope = host.Services.CreateScope();
            var db = scope.ServiceProvider.GetRequiredService<CasinoContext>();
            db.Database.EnsureDeleted();
            db.Database.Migrate();
        }
        return host;
    }
}


public class UnreachableDbFactory : CasinoApiFactory
{
    protected override string ConnectionString =>
        "Server=localhost,1;Database=Nichts;User Id=sa;Password=x;TrustServerCertificate=True;Connect Timeout=2";

    protected override bool CreateDatabase => false;
}