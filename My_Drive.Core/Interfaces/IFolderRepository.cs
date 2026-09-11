using My_Drive.Core.Entities;

namespace My_Drive.Core.Interfaces;

public interface IFolderRepository
{
    Task<Folder?> GetByIdAsync(Guid id);
    Task<IReadOnlyList<Folder>> GetByParentIdAsync(Guid? parentFolderId);
    Task AddAsync(Folder folder);
    Task SaveChangesAsync();
    Task<IReadOnlyList<Folder>> GetDeletedAsync();
    Task<Folder?> GetDeletedByIdAsync(Guid id);
    Task DeletePermanentAsync(Folder folder);
    Task<IReadOnlyList<Folder>> GetStarredAsync();
    Task<IReadOnlyList<Folder>> SearchAsync(string term);
}
