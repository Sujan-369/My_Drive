using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.AspNetCore.TestHost;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.DependencyInjection.Extensions;
using My_Drive.Core.Interfaces;
using Testcontainers.PostgreSql;
using Xunit;

namespace My_Drive.IntegrationTests;

public sealed class ApiFactory : WebApplicationFactory<Program>, IAsyncLifetime
{
    private readonly PostgreSqlContainer _db = new PostgreSqlBuilder("postgres:17-alpine").Build();

    public async Task InitializeAsync()
    {
        await _db.StartAsync();

        // Env vars are the one config source Program.cs sees before Build() runs.
        Environment.SetEnvironmentVariable(
            "ConnectionStrings__DefaultConnection",
            _db.GetConnectionString()
        );
        Environment.SetEnvironmentVariable(
            "Jwt__Key",
            "integration-tests-signing-key-integration-tests-0123456789"
        );
        Environment.SetEnvironmentVariable("Jwt__Issuer", "my-drive-tests");
        Environment.SetEnvironmentVariable("Jwt__Audience", "my-drive-tests-client");
        Environment.SetEnvironmentVariable("Google__ClientId", "test-client-id");
        Environment.SetEnvironmentVariable(
            "Azure__BlobStorageConnectionString",
            "UseDevelopmentStorage=true"
        );
    }

    protected override void ConfigureWebHost(IWebHostBuilder builder)
    {
        builder.UseEnvironment("Testing");
        builder.ConfigureTestServices(services =>
        {
            services.RemoveAll<IBlobStorageService>();
            services.AddSingleton<IBlobStorageService, InMemoryBlobStorage>();
        });
    }

    // WebApplicationFactory already has a ValueTask DisposeAsync, so implement xUnit's explicitly.
    async Task IAsyncLifetime.DisposeAsync()
    {
        await _db.DisposeAsync();
        await base.DisposeAsync();
    }
}