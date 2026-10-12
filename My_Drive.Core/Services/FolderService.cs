using My_Drive.Core.Entities;
using My_Drive.Core.Interfaces;
using My_Drive.Core.Models;

namespace My_Drive.Core.Services;

public sealed class FolderService(
    IFolderRepository folderRepository,
    IPermissionService permissionService,
    ICurrentOrganizationProvider currentOrganizationProvider
) : IFolderService
{
    private const string Unreachable = "The destination folder doesn't exist or isn't accessible.";

    public async Task<ServiceResult> ValidateContainerAsync(Guid? folderId)
    {
        if (folderId is not { } id)
            return ServiceResult.Ok();

        var folder = await folderRepository.GetByIdAsync(id);
        if (folder is null)
            return ServiceResult.Invalid(Unreachable);

        if (!await CanEditAsync(folder))
            return ServiceResult.Forbidden();

        // GetByIdAsync also returns folders shared in from other orgs. New items are
        // always created in the caller's org, so they'd be invisible inside that folder.
        if (folder.OrganizationId != currentOrganizationProvider.OrganizationId)
            return ServiceResult.Invalid(
                "New items can only be added to folders in your own organization."
            );

        return ServiceResult.Ok();
    }

    public async Task<ServiceResult> ValidateFolderMoveAsync(
        Folder folder,
        Guid? newParentFolderId
    )
    {
        if (newParentFolderId is not { } parentId)
            return ServiceResult.Ok();

        var parent = await folderRepository.GetByIdAsync(parentId);
        if (parent is null || parent.OrganizationId != folder.OrganizationId)
            return ServiceResult.Invalid(Unreachable);

        if (!await CanEditAsync(parent))
            return ServiceResult.Forbidden();

        if (await folderRepository.IsSelfOrDescendantAsync(folder.Id, parentId))
            return ServiceResult.Invalid(
                "A folder can't be moved into itself or one of its subfolders."
            );

        return ServiceResult.Ok();
    }

    public async Task<ServiceResult> ValidateFileMoveAsync(DriveFile file, Guid? newFolderId)
    {
        if (newFolderId is not { } folderId)
            return ServiceResult.Ok();

        var destination = await folderRepository.GetByIdAsync(folderId);
        if (destination is null || destination.OrganizationId != file.OrganizationId)
            return ServiceResult.Invalid(Unreachable);

        return await CanEditAsync(destination)
            ? ServiceResult.Ok()
            : ServiceResult.Forbidden();
    }

    private Task<bool> CanEditAsync(Folder folder) =>
        permissionService.CanEditAsync(ShareResourceType.Folder, folder.Id, folder.OrganizationId);
}