using My_Drive.Core.Interfaces;
using My_Drive.Core.Models;

namespace My_Drive.Core.Services;

public sealed record StorageQuotaOptions(long LimitBytes);

public sealed class StorageQuotaService(
    IFileRepository fileRepository,
    StorageQuotaOptions options
) : IStorageQuotaService
{
    public async Task<ServiceResult> EnsureCapacityAsync(long incomingBytes)
    {
        // Trash counts: its blobs still exist until the purge job runs.
        var used = await fileRepository.GetTotalSizeIncludingTrashAsync();
        if (used + incomingBytes <= options.LimitBytes)
            return ServiceResult.Ok();

        var limitGb = options.LimitBytes / (1024.0 * 1024 * 1024);
        return ServiceResult.QuotaExceeded(
            $"Storage limit reached ({limitGb:0.##} GB). Delete files and empty your trash to free up space."
        );
    }
}