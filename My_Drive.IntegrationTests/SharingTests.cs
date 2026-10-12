using System.Net;
using System.Net.Http.Json;
using Xunit;

namespace My_Drive.IntegrationTests;

[Collection("api")]
public sealed class SharingTests(ApiFactory factory) : ApiTestBase(factory)
{
    private sealed record ShareDto(bool Changed, string? PreviousPermission, string Permission);

    private sealed record SharedWithMeDto(Guid ResourceId, string Permission);

    private sealed record ErrorDto(string Message);

    [Fact]
    public async Task ShareTwice_UpdatesInPlaceAndReportsTheChange()
    {
        var owner = await CreateUserAsync();
        var guest = await CreateUserAsync();
        var folderId = await CreateFolderAsync(owner, "Shared");

        var first = await ShareFolderAsync(owner, folderId, guest, "Viewer");
        var second = await ShareFolderAsync(owner, folderId, guest, "Editor");

        Assert.Equal(HttpStatusCode.OK, first.StatusCode);
        Assert.Equal(HttpStatusCode.OK, second.StatusCode);
        var body = await second.Content.ReadFromJsonAsync<ShareDto>();
        Assert.True(body!.Changed);
        Assert.Equal("Viewer", body.PreviousPermission);

        var shared = await guest.Client.GetFromJsonAsync<List<SharedWithMeDto>>(
            "/api/shares/shared-with-me"
        );
        var entry = Assert.Single(shared!, s => s.ResourceId == folderId);
        Assert.Equal("Editor", entry.Permission);
    }

    [Fact]
    public async Task ShareAgainWithSamePermission_ReportsNoChange()
    {
        var owner = await CreateUserAsync();
        var guest = await CreateUserAsync();
        var folderId = await CreateFolderAsync(owner, "Shared");

        await ShareFolderAsync(owner, folderId, guest, "Viewer");
        var again = await ShareFolderAsync(owner, folderId, guest, "Viewer");

        var body = await again.Content.ReadFromJsonAsync<ShareDto>();
        Assert.False(body!.Changed);
    }

    [Fact]
    public async Task ViewerCannotReshare()
    {
        var owner = await CreateUserAsync();
        var viewer = await CreateUserAsync();
        var third = await CreateUserAsync();
        var folderId = await CreateFolderAsync(owner, "Shared");
        await ShareFolderAsync(owner, folderId, viewer, "Viewer");

        var response = await ShareFolderAsync(viewer, folderId, third, "Viewer");

        Assert.Equal(HttpStatusCode.Forbidden, response.StatusCode);
    }

    [Fact]
    public async Task ShareWithUnknownEmail_ReturnsAReadableError()
    {
        var owner = await CreateUserAsync();
        var folderId = await CreateFolderAsync(owner, "Shared");

        var response = await owner.Client.PostAsJsonAsync(
            $"/api/folders/{folderId}/share",
            new { recipientEmail = "nobody@example.test", permission = "Viewer" }
        );

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
        var error = await response.Content.ReadFromJsonAsync<ErrorDto>();
        Assert.Contains("No user found", error!.Message);
    }

    [Theory]
    [InlineData("7")]
    [InlineData("Owner")]
    public async Task ShareWithInvalidPermission_IsBadRequest(string permission)
    {
        var owner = await CreateUserAsync();
        var guest = await CreateUserAsync();
        var folderId = await CreateFolderAsync(owner, "Shared");

        var response = await ShareFolderAsync(owner, folderId, guest, permission);

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
    }
}