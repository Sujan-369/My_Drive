using Azure.Storage.Blobs;
using Azure.Storage.Blobs.Models;
using Microsoft.Extensions.Configuration;
using My_Drive.Core.Interfaces;

namespace My_Drive.Infrastructure.Storage;

public sealed class AzureBlobStorageService : IBlobStorageService
{
    private const string ContainerName = "files";
    private readonly BlobContainerClient _containerClient;

    public AzureBlobStorageService(IConfiguration configuration)
    {
        var connectionString = configuration["Azure:BlobStorageConnectionString"]?.Trim()
            ?? throw new InvalidOperationException("Azure:BlobStorageConnectionString is not configured.");

        var serviceClient = new BlobServiceClient(connectionString);
        _containerClient = serviceClient.GetBlobContainerClient(ContainerName);
        _containerClient.CreateIfNotExists();
    }

    public async Task<string> UploadAsync(Stream content, string blobPath, string contentType)
    {
        var blobClient = _containerClient.GetBlobClient(blobPath);
        var options = new BlobUploadOptions
        {
            HttpHeaders = new BlobHttpHeaders { ContentType = contentType }
        };
        await blobClient.UploadAsync(content, options);
        return blobPath;
    }

    public async Task<Stream> DownloadAsync(string blobPath)
    {
        var blobClient = _containerClient.GetBlobClient(blobPath);
        var response = await blobClient.DownloadStreamingAsync();
        return response.Value.Content;
    }

    public async Task DeleteAsync(string blobPath)
    {
        var blobClient = _containerClient.GetBlobClient(blobPath);
        await blobClient.DeleteIfExistsAsync();
    }
}