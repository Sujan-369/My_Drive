using My_Drive.Core.Entities;
using My_Drive.Core.Models;

namespace My_Drive.Core.Interfaces;

public interface IFolderService
{
    /// <summary>Can the caller put a new file/folder inside this folder? Null means "my root".</summary>
    Task<ServiceResult> ValidateContainerAsync(Guid? folderId);

    Task<ServiceResult> ValidateFolderMoveAsync(Folder folder, Guid? newParentFolderId);

    Task<ServiceResult> ValidateFileMoveAsync(DriveFile file, Guid? newFolderId);
}