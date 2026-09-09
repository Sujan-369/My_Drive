using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using My_Drive.Core.Interfaces;
using My_Drive.Infrastructure.Data;

namespace My_Drive.Infrastructure.BackgroundJobs;

public sealed class TrashPurgeService(
    IServiceScopeFactory scopeFactory,
    ILogger<TrashPurgeService> logger) : BackgroundService
{
    private static readonly TimeSpan Interval = TimeSpan.FromHours(24);
    private const int RetentionDays = 30;

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        while (!stoppingToken.IsCancellationRequested)
        {
            await PurgeExpiredAsync(stoppingToken);
            await Task.Delay(Interval, stoppingToken);
        }
    }

    private async Task PurgeExpiredAsync(CancellationToken cancellationToken)
    {
        // BackgroundService is a singleton, but DbContext must not be —
        // a fresh scope per run gets a correctly-scoped DbContext instance.
        using var scope = scopeFactory.CreateScope();
        var dbContext = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
        var blobStorageService = scope.ServiceProvider.GetRequiredService<IBlobStorageService>();

        var cutoff = DateTime.UtcNow.AddDays(-RetentionDays);

        // No org filter here on purpose — this is a system-wide maintenance
        // job with no "current user," so it correctly purges every org's
        // expired trash, not just one.
        var expiredFiles = await dbContext.DriveFiles
            .IgnoreQueryFilters()
            .Where(f => f.IsDeleted && f.DeletedAt < cutoff)
            .ToListAsync(cancellationToken);

        foreach (var file in expiredFiles)
        {
            foreach (var version in file.Versions)
            {
                await blobStorageService.DeleteAsync(version.BlobPath);
            }
            dbContext.DriveFiles.Remove(file);
        }

        var expiredFolders = await dbContext.Folders
            .IgnoreQueryFilters()
            .Where(f => f.IsDeleted && f.DeletedAt < cutoff)
            .ToListAsync(cancellationToken);
        dbContext.Folders.RemoveRange(expiredFolders);

        if (expiredFiles.Count > 0 || expiredFolders.Count > 0)
        {
            await dbContext.SaveChangesAsync(cancellationToken);
            logger.LogInformation(
                "Trash purge removed {FileCount} files and {FolderCount} folders",
                expiredFiles.Count, expiredFolders.Count);
        }
    }
}