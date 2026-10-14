using System.Net;
using System.Net.Http.Json;
using Xunit;

namespace My_Drive.IntegrationTests;

[Collection("api")]
public sealed class UploadPolicyTests(ApiFactory factory) : ApiTestBase(factory)
{
    private sealed record ErrorDto(string Message);

    [Fact]
    public async Task BlockedExtension_IsUnsupportedWithAReadableMessage()
    {
        var user = await CreateUserAsync();

        var response = await UploadAsync(user, null, fileName: "setup.exe");

        Assert.Equal(HttpStatusCode.UnsupportedMediaType, response.StatusCode);
        var error = await response.Content.ReadFromJsonAsync<ErrorDto>();
        Assert.Contains(".exe", error!.Message);
    }

    [Fact]
    public async Task OverThePerFileLimit_IsRejectedWithAReadableMessage()
    {
        var user = await CreateUserAsync();

        var response = await UploadAsync(user, null, sizeBytes: 12_000);

        Assert.Equal(HttpStatusCode.RequestEntityTooLarge, response.StatusCode);
        var error = await response.Content.ReadFromJsonAsync<ErrorDto>();
        Assert.Contains("per-file limit", error!.Message);
    }

    [Fact]
    public async Task FarOverTheLimit_IsRejectedBeforeModelBinding()
    {
        var user = await CreateUserAsync();

        var response = await UploadAsync(user, null, sizeBytes: 1_200_000);

        Assert.Equal(HttpStatusCode.RequestEntityTooLarge, response.StatusCode);
        var error = await response.Content.ReadFromJsonAsync<ErrorDto>();
        Assert.Contains("too large", error!.Message);
    }

    [Fact]
    public async Task InvalidFileName_IsBadRequestWithAReadableMessage()
    {
        var user = await CreateUserAsync();

        var response = await UploadAsync(user, null, fileName: "bad*name.txt");

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
        var error = await response.Content.ReadFromJsonAsync<ErrorDto>();
        Assert.Contains("aren't allowed", error!.Message);
    }
}