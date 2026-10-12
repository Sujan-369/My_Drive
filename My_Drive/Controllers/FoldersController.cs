using Microsoft.AspNetCore.Mvc;
using My_Drive.Contracts.Folders;
using My_Drive.Contracts.Sharing;
using My_Drive.Core.Entities;
using My_Drive.Core.Interfaces;

namespace My_Drive.Controllers;

[ApiController]
[Route("api/folders")]
public sealed class FoldersController(
    IFolderRepository folderRepository,
    IFolderService folderService,
    IFileRepository fileRepository,
    IBlobStorageService blobStorageService,
    ICurrentOrganizationProvider currentOrganizationProvider,
    ICurrentUserProvider currentUserProvider,
    IActivityLogger activityLogger,
    IPermissionService permissionService,
    IShareRepository shareRepository,
    IShareService shareService
) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<IReadOnlyList<FolderResponse>>> GetByParent(
        [FromQuery] Guid? parentFolderId
    )
    {
        var folders = await folderRepository.GetByParentIdAsync(parentFolderId);
        var sharedIds = await shareRepository.GetSharedResourceIdsAsync(
            currentUserProvider.UserId,
            ShareResourceType.Folder
        );
        return Ok(folders.Select(f => ToResponse(f, sharedIds.Contains(f.Id))));
    }

    [HttpGet("{id:guid}")]
    public async Task<ActionResult<FolderResponse>> GetById(Guid id)
    {
        var folder = await folderRepository.GetByIdAsync(id);
        return folder is null ? NotFound() : Ok(ToResponse(folder));
    }

    [HttpGet("trash")]
    public async Task<ActionResult<IReadOnlyList<FolderResponse>>> GetTrash()
    {
        var folders = await folderRepository.GetDeletedAsync();
        return Ok(folders.Select(f => ToResponse(f, false)));
    }

    [HttpGet("starred")]
    public async Task<ActionResult<IReadOnlyList<FolderResponse>>> GetStarred()
    {
        var folders = await folderRepository.GetStarredAsync();
        return Ok(folders.Select(f => ToResponse(f, false)));
    }

    [HttpPost]
    public async Task<ActionResult<FolderResponse>> Create([FromBody] CreateFolderRequest request)
    {
        var container = await folderService.ValidateContainerAsync(request.ParentFolderId);
        if (!container.IsOk)
            return this.ToFailure(container);

        var folder = new Folder(
            currentOrganizationProvider.OrganizationId,
            currentUserProvider.UserId,
            request.Name,
            request.ParentFolderId
        );
        await folderRepository.AddAsync(folder);
        await activityLogger.LogAsync(
            ActivityAction.Created,
            ActivityResourceType.Folder,
            folder.Id,
            folder.Name
        );
        return CreatedAtAction(nameof(GetById), new { id = folder.Id }, ToResponse(folder));
    }

    [HttpPut("{id:guid}/rename")]
    public async Task<ActionResult<FolderResponse>> Rename(
        Guid id,
        [FromBody] RenameFolderRequest request
    )
    {
        var folder = await folderRepository.GetByIdAsync(id);
        if (folder is null)
            return NotFound();
        if (
            !await permissionService.CanEditAsync(
                ShareResourceType.Folder,
                folder.Id,
                folder.OrganizationId
            )
        )
            return Forbid();

        folder.Rename(request.Name);
        await folderRepository.SaveChangesAsync();
        await activityLogger.LogAsync(
            ActivityAction.Renamed,
            ActivityResourceType.Folder,
            folder.Id,
            folder.Name
        );
        return Ok(ToResponse(folder));
    }

    [HttpPut("{id:guid}/move")]
    public async Task<ActionResult<FolderResponse>> Move(
        Guid id,
        [FromBody] MoveFolderRequest request
    )
    {
        var folder = await folderRepository.GetByIdAsync(id);
        if (folder is null)
            return NotFound();
        if (
            !await permissionService.CanEditAsync(
                ShareResourceType.Folder,
                folder.Id,
                folder.OrganizationId
            )
        )
            return Forbid();

        var check = await folderService.ValidateFolderMoveAsync(folder, request.NewParentFolderId);
        if (!check.IsOk)
            return this.ToFailure(check);

        folder.MoveTo(request.NewParentFolderId);
        await folderRepository.SaveChangesAsync();
        await activityLogger.LogAsync(
            ActivityAction.Moved,
            ActivityResourceType.Folder,
            folder.Id,
            folder.Name
        );
        return Ok(ToResponse(folder));
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Delete(Guid id)
    {
        var folder = await folderRepository.GetByIdAsync(id);
        if (folder is null)
            return NotFound();
        if (
            !await permissionService.CanEditAsync(
                ShareResourceType.Folder,
                folder.Id,
                folder.OrganizationId
            )
        )
            return Forbid();

        folder.Delete();
        await folderRepository.SaveChangesAsync();
        await activityLogger.LogAsync(
            ActivityAction.Deleted,
            ActivityResourceType.Folder,
            folder.Id,
            folder.Name
        );
        return NoContent();
    }

    [HttpPut("{id:guid}/restore")]
    public async Task<ActionResult<FolderResponse>> Restore(Guid id)
    {
        var folder = await folderRepository.GetDeletedByIdAsync(id);
        if (folder is null)
            return NotFound();

        folder.Restore();
        await folderRepository.SaveChangesAsync();
        await activityLogger.LogAsync(
            ActivityAction.Restored,
            ActivityResourceType.Folder,
            folder.Id,
            folder.Name
        );
        return Ok(ToResponse(folder));
    }

    [HttpDelete("{id:guid}/permanent")]
    public async Task<IActionResult> DeletePermanent(Guid id)
    {
        var folder = await folderRepository.GetDeletedByIdAsync(id);
        if (folder is null)
            return NotFound();

        var foldersToDelete = await folderRepository.GetDescendantsAsync(id);
        var folderIds = foldersToDelete.Select(f => f.Id).ToList();
        var filesToDelete = await fileRepository.GetByFolderIdsAsync(folderIds);

        foreach (var file in filesToDelete)
        {
            foreach (var version in file.Versions)
            {
                await blobStorageService.DeleteAsync(version.BlobPath);
            }
        }

        fileRepository.DeleteRange(filesToDelete);
        folderRepository.DeleteRange(foldersToDelete.AsEnumerable().Reverse());

        await folderRepository.SaveChangesAsync();

        return NoContent();
    }

    [HttpPut("{id:guid}/star")]
    public async Task<ActionResult<FolderResponse>> Star(Guid id)
    {
        var folder = await folderRepository.GetByIdAsync(id);
        if (folder is null)
            return NotFound();
        if (
            !await permissionService.CanEditAsync(
                ShareResourceType.Folder,
                folder.Id,
                folder.OrganizationId
            )
        )
            return Forbid();

        folder.Star();
        await folderRepository.SaveChangesAsync();
        return Ok(ToResponse(folder));
    }

    [HttpPut("{id:guid}/unstar")]
    public async Task<ActionResult<FolderResponse>> Unstar(Guid id)
    {
        var folder = await folderRepository.GetByIdAsync(id);
        if (folder is null)
            return NotFound();
        if (
            !await permissionService.CanEditAsync(
                ShareResourceType.Folder,
                folder.Id,
                folder.OrganizationId
            )
        )
            return Forbid();

        folder.Unstar();
        await folderRepository.SaveChangesAsync();
        return Ok(ToResponse(folder));
    }

    [HttpPost("{id:guid}/share")]
    public async Task<ActionResult<ShareResponse>> Share(
        Guid id,
        [FromBody] CreateShareRequest request
    )
    {
        var folder = await folderRepository.GetByIdAsync(id);
        if (folder is null)
            return NotFound();
        if (
            !await permissionService.CanShareAsync(
                ShareResourceType.Folder,
                folder.Id,
                folder.OrganizationId
            )
        )
            return Forbid();

        var grant = await shareService.GrantAsync(
            ShareResourceType.Folder,
            folder.Id,
            folder.Name,
            request.RecipientEmail,
            request.Permission
        );
        if (!grant.Outcome.IsOk)
            return this.ToFailure(grant.Outcome);

        return Ok(grant.ToResponse(request.RecipientEmail));
    }

    private static FolderResponse ToResponse(Folder folder, bool isShared = false) =>
        new(
            folder.Id,
            folder.Name,
            folder.ParentFolderId,
            folder.CreatedAt,
            folder.ModifiedAt,
            folder.DeletedAt,
            folder.IsStarred,
            isShared
        );
}
