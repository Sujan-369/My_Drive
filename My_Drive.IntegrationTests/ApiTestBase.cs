using System.Net;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using Microsoft.Extensions.DependencyInjection;
using My_Drive.Core.Entities;
using My_Drive.Core.Interfaces;
using Xunit;

namespace My_Drive.IntegrationTests;

[CollectionDefinition("api")]
public sealed class ApiCollection : ICollectionFixture<ApiFactory>;

public sealed record TestUser(User User, HttpClient Client);

public sealed record IdDto(Guid Id);

public abstract class ApiTestBase(ApiFactory factory)
{
    protected ApiFactory Factory { get; } = factory;

    /// <summary>Seeds a fresh user + org and returns a client carrying a real JWT for them.</summary>
    protected async Task<TestUser> CreateUserAsync()
    {
        using var scope = Factory.Services.CreateScope();
        var orgs = scope.ServiceProvider.GetRequiredService<IOrganizationRepository>();
        var users = scope.ServiceProvider.GetRequiredService<IUserRepository>();
        var tokens = scope.ServiceProvider.GetRequiredService<ITokenService>();

        var suffix = Guid.NewGuid().ToString("N");
        var org = new Organization($"Org {suffix}");
        await orgs.AddAsync(org);
        var user = new User(
            org.Id,
            $"user-{suffix}@example.test",
            $"User {suffix[..6]}",
            $"sub-{suffix}"
        );
        await users.AddAsync(user);

        var client = Factory.CreateClient();
        client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue(
            "Bearer",
            tokens.GenerateToken(user)
        );
        return new TestUser(user, client);
    }

    protected static async Task<Guid> CreateFolderAsync(
        TestUser user,
        string name,
        Guid? parentId = null
    )
    {
        var response = await user.Client.PostAsJsonAsync(
            "/api/folders",
            new { name, parentFolderId = parentId }
        );
        Assert.Equal(HttpStatusCode.Created, response.StatusCode);
        return (await response.Content.ReadFromJsonAsync<IdDto>())!.Id;
    }

    protected static Task<HttpResponseMessage> ShareFolderAsync(
        TestUser owner,
        Guid folderId,
        TestUser recipient,
        string permission
    ) =>
        owner.Client.PostAsJsonAsync(
            $"/api/folders/{folderId}/share",
            new { recipientEmail = recipient.User.Email, permission }
        );

    protected static Task<HttpResponseMessage> UploadAsync(
        TestUser user,
        Guid? folderId,
        string fileName = "hello.txt",
        int sizeBytes = 5
    )
    {
        var form = new MultipartFormDataContent();
        var file = new ByteArrayContent(new byte[sizeBytes]);
        file.Headers.ContentType = new MediaTypeHeaderValue("text/plain");
        form.Add(file, "File", fileName);
        if (folderId is { } id)
            form.Add(new StringContent(id.ToString()), "FolderId");
        return user.Client.PostAsync("/api/files", form);
    }
}