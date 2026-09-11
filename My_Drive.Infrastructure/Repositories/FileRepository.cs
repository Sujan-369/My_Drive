using Microsoft.EntityFrameworkCore;
using My_Drive.Core.Entities;
using My_Drive.Core.Interfaces;
using My_Drive.Infrastructure.Data;

namespace My_Drive.Infrastructure.Repositories;

public sealed class FileRepository(
    ApplicationDbContext dbContext,
    ICurrentOrganizationProvider currentOrganizationProvider
) : IFileRepository
{
    public async Task<DriveFile?> GetByIdAsync(Guid id) =>
        await dbContext.DriveFiles.FirstOrDefaultAsync(f => f.Id == id);

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

    public async Task<IReadOnlyList<DriveFile>> GetStarredAsync() =>
        await dbContext.DriveFiles.Where(f => f.IsStarred).OrderBy(f => f.Name).ToListAsync();

    public async Task<long> GetTotalSizeAsync() => await dbContext.DriveFiles.SumAsync(f => f.Size);

    public async Task<IReadOnlyList<DriveFile>> GetRecentAsync(int take) =>
        await dbContext.DriveFiles.OrderByDescending(f => f.ModifiedAt).Take(take).ToListAsync();

    public async Task<IReadOnlyList<DriveFile>> SearchAsync(string term) =>
        await dbContext
            .DriveFiles.Where(f => EF.Functions.ILike(f.Name, $"%{term}%"))
            .OrderByDescending(f => f.ModifiedAt)
            .ToListAsync();
}
