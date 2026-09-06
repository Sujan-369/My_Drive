using Microsoft.EntityFrameworkCore;
using My_Drive.Core.Entities;
using My_Drive.Core.Interfaces;
using My_Drive.Infrastructure.Data;

namespace My_Drive.Infrastructure.Repositories;

public sealed class FileRepository(ApplicationDbContext dbContext) : IFileRepository
{
    public async Task<DriveFile?> GetByIdAsync(Guid id) =>
        await dbContext.DriveFiles.FirstOrDefaultAsync(f => f.Id == id);

    public async Task<IReadOnlyList<DriveFile>> GetByFolderIdAsync(Guid? folderId) =>
        await dbContext.DriveFiles
            .Where(f => f.FolderId == folderId)
            .OrderBy(f => f.Name)
            .ToListAsync();

    public async Task AddAsync(DriveFile file)
    {
        dbContext.DriveFiles.Add(file);
        await dbContext.SaveChangesAsync();
    }

    public async Task SaveChangesAsync() => await dbContext.SaveChangesAsync();
}