using Microsoft.AspNetCore.Mvc;
using My_Drive.Contracts.Folders;
using My_Drive.Core.Entities;
using My_Drive.Core.Interfaces;

namespace My_Drive.Controllers;

[ApiController]
[Route("api/folders")]
public sealed class FoldersController(
    IFolderRepository folderRepository,
    ICurrentOrganizationProvider currentOrganizationProvider,
    ICurrentUserProvider currentUserProvider,
    IActivityLogger activityLogger
) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<IReadOnlyList<FolderResponse>>> GetByParent(
        [FromQuery] Guid? parentFolderId
    )
    {
        var folders = await folderRepository.GetByParentIdAsync(parentFolderId);
        return Ok(folders.Select(ToResponse));
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
        return Ok(folders.Select(ToResponse));
    }

    [HttpGet("starred")]
    public async Task<ActionResult<IReadOnlyList<FolderResponse>>> GetStarred()
    {
        var folders = await folderRepository.GetStarredAsync();
        return Ok(folders.Select(ToResponse));
    }

    [HttpPost]
    public async Task<ActionResult<FolderResponse>> Create([FromBody] CreateFolderRequest request)
    {
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

        await folderRepository.DeletePermanentAsync(folder);
        return NoContent();
    }

    [HttpPut("{id:guid}/star")]
    public async Task<ActionResult<FolderResponse>> Star(Guid id)
    {
        var folder = await folderRepository.GetByIdAsync(id);
        if (folder is null)
            return NotFound();

        folder.Star();
        await folderRepository.SaveChangesAsync();
        await activityLogger.LogAsync(
            ActivityAction.Starred,
            ActivityResourceType.Folder,
            folder.Id,
            folder.Name
        );
        return Ok(ToResponse(folder));
    }

    [HttpPut("{id:guid}/unstar")]
    public async Task<ActionResult<FolderResponse>> Unstar(Guid id)
    {
        var folder = await folderRepository.GetByIdAsync(id);
        if (folder is null)
            return NotFound();

        folder.Unstar();
        await folderRepository.SaveChangesAsync();
        await activityLogger.LogAsync(
            ActivityAction.Unstarred,
            ActivityResourceType.Folder,
            folder.Id,
            folder.Name
        );
        return Ok(ToResponse(folder));
    }

    private static FolderResponse ToResponse(Folder folder) =>
        new(
            folder.Id,
            folder.Name,
            folder.ParentFolderId,
            folder.CreatedAt,
            folder.ModifiedAt,
            folder.DeletedAt,
            folder.IsStarred
        );
}
