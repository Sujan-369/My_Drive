using System.Net;
using System.Net.Http.Json;
using Xunit;

namespace My_Drive.IntegrationTests;

[Collection("api")]
public sealed class StorageQuotaTests(ApiFactory factory) : ApiTestBase(factory)
{
    private sealed record ErrorDto(string Message);

    [Fact]
    public async Task Upload_OverTheLimit_IsRejectedWithAReadableMessage()
    {
        var user = await CreateUserAsync();

        var response = await UploadAsync(user, null, sizeBytes: 6000);

        Assert.Equal(HttpStatusCode.RequestEntityTooLarge, response.StatusCode);
        var error = await response.Content.ReadFromJsonAsync<ErrorDto>();
        Assert.Contains("Storage limit", error!.Message);
    }

    [Fact]
    public async Task TrashedFiles_StillCountTowardTheLimit()
    {
        var user = await CreateUserAsync();
        var first = await UploadAsync(user, null, sizeBytes: 3000);
        Assert.Equal(HttpStatusCode.Created, first.StatusCode);
        var id = (await first.Content.ReadFromJsonAsync<IdDto>())!.Id;
        var delete = await user.Client.DeleteAsync($"/api/files/{id}");
        Assert.Equal(HttpStatusCode.NoContent, delete.StatusCode);

        var second = await UploadAsync(user, null, sizeBytes: 3000);

        Assert.Equal(HttpStatusCode.RequestEntityTooLarge, second.StatusCode);
    }
}