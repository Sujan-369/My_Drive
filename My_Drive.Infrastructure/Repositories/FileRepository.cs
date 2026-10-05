using Microsoft.EntityFrameworkCore;
using My_Drive.Core.Entities;
using My_Drive.Core.Interfaces;
using My_Drive.Infrastructure.Data;

namespace My_Drive.Infrastructure.Repositories;

public sealed class FileRepository(
    ApplicationDbContext dbContext,
    ICurrentOrganizationProvider currentOrganizationProvider,
    ICurrentUserProvider currentUserProvider
) : IFileRepository
{
    public async Task<DriveFile?> GetByIdAsync(Guid id)
    {
        var ownFile = await dbContext.DriveFiles.FirstOrDefaultAsync(f => f.Id == id);
        if (ownFile is not null)
            return ownFile;

        var candidate = await dbContext
            .DriveFiles.IgnoreQueryFilters()
            .FirstOrDefaultAsync(f => f.Id == id && !f.IsDeleted);
        if (candidate is null)
            return null;

        var hasAccess = await dbContext.Shares.AnyAsync(s =>
            s.ResourceType == ShareResourceType.File
            && s.ResourceId == id
            && s.SharedWithUserId == currentUserProvider.UserId
            && (s.ExpiresAt == null || s.ExpiresAt > DateTime.UtcNow)
        );

        return hasAccess ? candidate : null;
    }

    public async Task<IReadOnlyList<DriveFile>> GetByFolderIdAsync(Guid? folderId) =>
        await dbContext
            .DriveFiles.Where(f => f.FolderId == folderId)
            .OrderBy(f => f.Name)
            .ToListAsync();

    public async Task AddAsync(DriveFile file)
    {
        dbContext.DriveFiles.Add(file);
        await dbContext.SaveChangesAsync();
    }

    public async Task SaveChangesAsync() => await dbContext.SaveChangesAsync();

    public async Task<IReadOnlyList<DriveFile>> GetDeletedAsync() =>
        await dbContext
            .DriveFiles.IgnoreQueryFilters()
            .Where(f =>
                f.OrganizationId == currentOrganizationProvider.OrganizationId && f.IsDeleted
            )
            .OrderByDescending(f => f.DeletedAt)
            .ToListAsync();

    public async Task<DriveFile?> GetDeletedByIdAsync(Guid id) =>
        await dbContext
            .DriveFiles.IgnoreQueryFilters()
            .FirstOrDefaultAsync(f =>
                f.Id == id
                && f.OrganizationId == currentOrganizationProvider.OrganizationId
                && f.IsDeleted
            );

    public async Task DeletePermanentAsync(DriveFile file)
    {
        dbContext.DriveFiles.Remove(file);
        await dbContext.SaveChangesAsync();
    }

    public async Task<IReadOnlyList<DriveFile>> GetByFolderIdsAsync(IEnumerable<Guid> folderIds)
    {
        var ids = folderIds.ToList();
        return await dbContext
            .DriveFiles.IgnoreQueryFilters()
            .Include(f => f.Versions)
            .Where(f => f.FolderId != null && ids.Contains(f.FolderId.Value))
            .ToListAsync();
    }

    public void DeleteRange(IEnumerable<DriveFile> files) =>
        dbContext.DriveFiles.RemoveRange(files);

    public async Task<IReadOnlyList<DriveFile>> GetStarredAsync() =>
        await dbContext.DriveFiles.Where(f => f.IsStarred).OrderBy(f => f.Name).ToListAsync();

    public async Task<IReadOnlyList<DriveFile>> SearchAsync(string term) =>
        await dbContext
            .DriveFiles.Where(f => EF.Functions.ILike(f.Name, $"%{term}%"))
            .OrderByDescending(f => f.ModifiedAt)
            .ToListAsync();

    public async Task<long> GetTotalSizeAsync() => await dbContext.DriveFiles.SumAsync(f => f.Size);

    public async Task<IReadOnlyList<DriveFile>> GetRecentAsync(int take, DateTime? after)
    {
        var query = dbContext.DriveFiles.AsQueryable();
        if (after is not null)
        {
            query = query.Where(f => (f.LastAccessedAt ?? f.ModifiedAt) > after);
        }
        return await query
            .OrderByDescending(f => f.LastAccessedAt ?? f.ModifiedAt)
            .Take(take)
            .ToListAsync();
    }
}
