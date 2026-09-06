using My_Drive.Core.Entities;

namespace My_Drive.Core.Interfaces;

public interface IFolderRepository
{
    Task<Folder?> GetByIdAsync(Guid id);
    Task<IReadOnlyList<Folder>> GetByParentIdAsync(Guid? parentFolderId);
    Task AddAsync(Folder folder);
    Task SaveChangesAsync();
}