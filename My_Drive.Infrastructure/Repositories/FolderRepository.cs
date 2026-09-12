using Microsoft.EntityFrameworkCore;
using My_Drive.Core.Entities;
using My_Drive.Core.Interfaces;
using My_Drive.Infrastructure.Data;

namespace My_Drive.Infrastructure.Repositories;

public sealed class FolderRepository(
    ApplicationDbContext dbContext,
    ICurrentOrganizationProvider currentOrganizationProvider,
    ICurrentUserProvider currentUserProvider
) : IFolderRepository
{
    public async Task<Folder?> GetByIdAsync(Guid id)
    {
        var ownFolder = await dbContext.Folders.FirstOrDefaultAsync(f => f.Id == id);
        if (ownFolder is not null)
            return ownFolder;

        // Not in your own org — check whether it's been explicitly shared with you.
        var candidate = await dbContext
            .Folders.IgnoreQueryFilters()
            .FirstOrDefaultAsync(f => f.Id == id && !f.IsDeleted);
        if (candidate is null)
            return null;

        var hasAccess = await dbContext.Shares.AnyAsync(s =>
            s.ResourceType == ShareResourceType.Folder
            && s.ResourceId == id
            && s.SharedWithUserId == currentUserProvider.UserId
            && (s.ExpiresAt == null || s.ExpiresAt > DateTime.UtcNow)
        );

        return hasAccess ? candidate : null;
    }

    public async Task<IReadOnlyList<Folder>> GetByParentIdAsync(Guid? parentFolderId) =>
        await dbContext
            .Folders.Where(f => f.ParentFolderId == parentFolderId)
            .OrderBy(f => f.Name)
            .ToListAsync();

    public async Task AddAsync(Folder folder)
    {
        dbContext.Folders.Add(folder);
        await dbContext.SaveChangesAsync();
    }

    public async Task SaveChangesAsync() => await dbContext.SaveChangesAsync();

    public async Task<IReadOnlyList<Folder>> GetDeletedAsync() =>
        await dbContext
            .Folders.IgnoreQueryFilters()
            .Where(f =>
                f.OrganizationId == currentOrganizationProvider.OrganizationId && f.IsDeleted
            )
            .OrderByDescending(f => f.DeletedAt)
            .ToListAsync();

    public async Task<Folder?> GetDeletedByIdAsync(Guid id) =>
        await dbContext
            .Folders.IgnoreQueryFilters()
            .FirstOrDefaultAsync(f =>
                f.Id == id
                && f.OrganizationId == currentOrganizationProvider.OrganizationId
                && f.IsDeleted
            );

    public async Task DeletePermanentAsync(Folder folder)
    {
        dbContext.Folders.Remove(folder);
        await dbContext.SaveChangesAsync();
    }

    public async Task<IReadOnlyList<Folder>> GetStarredAsync() =>
        await dbContext.Folders.Where(f => f.IsStarred).OrderBy(f => f.Name).ToListAsync();

    public async Task<IReadOnlyList<Folder>> SearchAsync(string term) =>
        await dbContext
            .Folders.Where(f => EF.Functions.ILike(f.Name, $"%{term}%"))
            .OrderByDescending(f => f.ModifiedAt)
            .ToListAsync();
}
