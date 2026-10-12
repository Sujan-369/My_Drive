using System.Net;
using System.Net.Http.Json;
using Xunit;

namespace My_Drive.IntegrationTests;

[Collection("api")]
public sealed class MoveTests(ApiFactory factory) : ApiTestBase(factory)
{
    private static Task<HttpResponseMessage> MoveFolderAsync(
        TestUser user,
        Guid folderId,
        Guid? newParentId
    ) =>
        user.Client.PutAsJsonAsync(
            $"/api/folders/{folderId}/move",
            new { newParentFolderId = newParentId }
        );

    [Fact]
    public async Task MoveFolder_IntoItself_IsBadRequest()
    {
        var user = await CreateUserAsync();
        var folderId = await CreateFolderAsync(user, "A");

        var response = await MoveFolderAsync(user, folderId, folderId);

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
    }

    [Fact]
    public async Task MoveFolder_IntoDescendant_IsBadRequest()
    {
        var user = await CreateUserAsync();
        var parent = await CreateFolderAsync(user, "Parent");
        var child = await CreateFolderAsync(user, "Child", parent);
        var grandchild = await CreateFolderAsync(user, "Grandchild", child);

        var response = await MoveFolderAsync(user, parent, grandchild);

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
    }

    [Fact]
    public async Task MoveFolder_IntoSibling_Succeeds()
    {
        var user = await CreateUserAsync();
        var a = await CreateFolderAsync(user, "A");
        var b = await CreateFolderAsync(user, "B");

        var response = await MoveFolderAsync(user, a, b);

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
    }

    [Fact]
    public async Task MoveFolder_IntoAnotherOrgsFolder_IsBadRequest()
    {
        var alice = await CreateUserAsync();
        var bob = await CreateUserAsync();
        var mine = await CreateFolderAsync(alice, "Mine");
        var theirs = await CreateFolderAsync(bob, "Theirs");

        var response = await MoveFolderAsync(alice, mine, theirs);

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
    }

    [Fact]
    public async Task MoveFile_IntoAnotherOrgsFolder_IsBadRequest()
    {
        var alice = await CreateUserAsync();
        var bob = await CreateUserAsync();
        var upload = await UploadAsync(alice, null);
        var fileId = (await upload.Content.ReadFromJsonAsync<IdDto>())!.Id;
        var theirs = await CreateFolderAsync(bob, "Theirs");

        var response = await alice.Client.PutAsJsonAsync(
            $"/api/files/{fileId}/move",
            new { newFolderId = theirs }
        );

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
    }
}