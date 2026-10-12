using System.Collections.Concurrent;
using My_Drive.Core.Interfaces;

namespace My_Drive.IntegrationTests;

public sealed class InMemoryBlobStorage : IBlobStorageService
{
    private readonly ConcurrentDictionary<string, byte[]> _blobs = new();

    public async Task<string> UploadAsync(Stream content, string blobPath, string contentType)
    {
        using var buffer = new MemoryStream();
        await content.CopyToAsync(buffer);
        _blobs[blobPath] = buffer.ToArray();
        return blobPath;
    }

    public Task<Stream> DownloadAsync(string blobPath) =>
        Task.FromResult<Stream>(new MemoryStream(_blobs[blobPath]));

    public Task DeleteAsync(string blobPath)
    {
        _blobs.TryRemove(blobPath, out _);
        return Task.CompletedTask;
    }
}