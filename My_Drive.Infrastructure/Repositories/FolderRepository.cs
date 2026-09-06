using Microsoft.EntityFrameworkCore;
using My_Drive.Core.Entities;
using My_Drive.Core.Interfaces;
using My_Drive.Infrastructure.Data;

namespace My_Drive.Infrastructure.Repositories;

public sealed class FolderRepository(ApplicationDbContext dbContext) : IFolderRepository
{
    public async Task<Folder?> GetByIdAsync(Guid id) =>
        await dbContext.Folders.FirstOrDefaultAsync(f => f.Id == id);

    public async Task<IReadOnlyList<Folder>> GetByParentIdAsync(Guid? parentFolderId) =>
        await dbContext.Folders
            .Where(f => f.ParentFolderId == parentFolderId)
            .OrderBy(f => f.Name)
            .ToListAsync();

    public async Task AddAsync(Folder folder)
    {
        dbContext.Folders.Add(folder);
        await dbContext.SaveChangesAsync();
    }

    public async Task SaveChangesAsync() => await dbContext.SaveChangesAsync();
}