using My_Drive.Core.Entities;

namespace My_Drive.Core.Interfaces;

public interface IFileRepository
{
    Task<DriveFile?> GetByIdAsync(Guid id);
    Task<IReadOnlyList<DriveFile>> GetByFolderIdAsync(Guid? folderId);
    Task AddAsync(DriveFile file);
    Task SaveChangesAsync();
    Task<IReadOnlyList<DriveFile>> GetDeletedAsync();
    Task<DriveFile?> GetDeletedByIdAsync(Guid id);
    Task DeletePermanentAsync(DriveFile file);
    Task<IReadOnlyList<DriveFile>> GetStarredAsync();
}