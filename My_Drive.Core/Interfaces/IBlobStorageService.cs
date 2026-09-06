namespace My_Drive.Core.Interfaces;

public interface IBlobStorageService
{
    Task<string> UploadAsync(Stream content, string blobPath, string contentType);
    Task<Stream> DownloadAsync(string blobPath);
    Task DeleteAsync(string blobPath);
}