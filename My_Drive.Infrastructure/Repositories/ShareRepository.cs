using Microsoft.EntityFrameworkCore;
using My_Drive.Core.Entities;
using My_Drive.Core.Interfaces;
using My_Drive.Core.Models;
using My_Drive.Infrastructure.Data;

namespace My_Drive.Infrastructure.Repositories;

public sealed class ShareRepository(ApplicationDbContext dbContext) : IShareRepository
{
    public async Task AddAsync(Share share)
    {
        dbContext.Shares.Add(share);
        await dbContext.SaveChangesAsync();
    }

    public async Task<HashSet<Guid>> GetSharedResourceIdsAsync(
        Guid sharedByUserId,
        ShareResourceType resourceType
    ) =>
        [
            .. await dbContext
                .Shares.Where(s =>
                    s.SharedByUserId == sharedByUserId
                    && s.ResourceType == resourceType
                    && (s.ExpiresAt == null || s.ExpiresAt > DateTime.UtcNow)
                )
                .Select(s => s.ResourceId)
                .ToListAsync(),
        ];

    public async Task<IReadOnlyList<SharedResourceInfo>> GetSharedWithMeAsync(Guid userId)
    {
        var shares = await dbContext
            .Shares.Where(s =>
                s.SharedWithUserId == userId
                && (s.ExpiresAt == null || s.ExpiresAt > DateTime.UtcNow)
            )
            .ToListAsync();

        var results = new List<SharedResourceInfo>();

        // N+1 by design for now, not overlooked — share counts are small at
        // this scale; batching this becomes worth the complexity later, not yet.
        foreach (var share in shares)
        {
            var sharer = await dbContext
                .Users.IgnoreQueryFilters()
                .FirstOrDefaultAsync(u => u.Id == share.SharedByUserId);
            if (sharer is null)
                continue;

            var resourceName =
                share.ResourceType == ShareResourceType.Folder
                    ? (
                        await dbContext
                            .Folders.IgnoreQueryFilters()
                            .FirstOrDefaultAsync(f => f.Id == share.ResourceId && !f.IsDeleted)
                    )?.Name
                    : (
                        await dbContext
                            .DriveFiles.IgnoreQueryFilters()
                            .FirstOrDefaultAsync(f => f.Id == share.ResourceId && !f.IsDeleted)
                    )?.Name;

            if (resourceName is null)
                continue; // resource was deleted after being shared

            results.Add(
                new SharedResourceInfo(
                    share.Id,
                    share.ResourceType,
                    share.ResourceId,
                    resourceName,
                    sharer.Email,
                    sharer.DisplayName,
                    share.Permission,
                    share.CreatedAt
                )
            );
        }

        return [.. results.OrderByDescending(r => r.SharedAt)];
    }
}
