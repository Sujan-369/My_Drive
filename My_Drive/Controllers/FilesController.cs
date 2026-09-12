using System.Security.Cryptography;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.StaticFiles;
using My_Drive.Contracts.Files;
using My_Drive.Contracts.Sharing;
using My_Drive.Core.Entities;
using My_Drive.Core.Interfaces;

namespace My_Drive.Controllers;

[ApiController]
[Route("api/files")]
public sealed class FilesController(
    IFileRepository fileRepository,
    IFolderRepository folderRepository,
    IBlobStorageService blobStorageService,
    ICurrentOrganizationProvider currentOrganizationProvider,
    ICurrentUserProvider currentUserProvider,
    IActivityLogger activityLogger,
    IPermissionService permissionService,
    IShareRepository shareRepository,
    IUserRepository userRepository
) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<IReadOnlyList<FileResponse>>> GetByFolder(
        [FromQuery] Guid? folderId
    )
    {
        var files = await fileRepository.GetByFolderIdAsync(folderId);
        return Ok(files.Select(ToResponse));
    }

    [HttpGet("{id:guid}")]
    public async Task<ActionResult<FileResponse>> GetById(Guid id)
    {
        var file = await fileRepository.GetByIdAsync(id);
        return file is null ? NotFound() : Ok(ToResponse(file));
    }

    [HttpGet("trash")]
    public async Task<ActionResult<IReadOnlyList<FileResponse>>> GetTrash()
    {
        var files = await fileRepository.GetDeletedAsync();
        return Ok(files.Select(ToResponse));
    }

    [HttpGet("starred")]
    public async Task<ActionResult<IReadOnlyList<FileResponse>>> GetStarred()
    {
        var files = await fileRepository.GetStarredAsync();
        return Ok(files.Select(ToResponse));
    }

    [HttpGet("recent")]
    public async Task<ActionResult<IReadOnlyList<FileResponse>>> GetRecent(
        [FromQuery] int take = 10
    )
    {
        var files = await fileRepository.GetRecentAsync(take);
        return Ok(files.Select(ToResponse));
    }

    [HttpPost]
    [RequestSizeLimit(100_000_000)]
    public async Task<ActionResult<FileResponse>> Upload([FromForm] UploadFileRequest request)
    {
        if (request.FolderId is not null)
        {
            var folder = await folderRepository.GetByIdAsync(request.FolderId.Value);
            if (folder is null)
            {
                return BadRequest("The specified folder doesn't exist or isn't accessible.");
            }
        }

        var orgId = currentOrganizationProvider.OrganizationId;
        var blobPath = $"{orgId}/{Guid.NewGuid()}";

        await using var stream = request.File.OpenReadStream();
        using var buffered = new MemoryStream();
        await stream.CopyToAsync(buffered);
        buffered.Position = 0;

        var contentHash = Convert.ToHexString(await SHA256.HashDataAsync(buffered));
        buffered.Position = 0;

        await blobStorageService.UploadAsync(buffered, blobPath, request.File.ContentType);

        var file = new DriveFile(
            orgId,
            currentUserProvider.UserId,
            request.File.FileName,
            request.FolderId,
            blobPath,
            request.File.Length,
            contentHash
        );
        await fileRepository.AddAsync(file);
        await activityLogger.LogAsync(
            ActivityAction.Uploaded,
            ActivityResourceType.File,
            file.Id,
            file.Name
        );

        return CreatedAtAction(nameof(GetById), new { id = file.Id }, ToResponse(file));
    }

    [HttpGet("{id:guid}/download")]
    public async Task<IActionResult> Download(Guid id)
    {
        var file = await fileRepository.GetByIdAsync(id);
        if (file is null)
            return NotFound();

        var currentVersion = file.Versions.First(v => v.Id == file.CurrentVersionId);
        var content = await blobStorageService.DownloadAsync(currentVersion.BlobPath);

        var contentTypeProvider = new FileExtensionContentTypeProvider();
        if (!contentTypeProvider.TryGetContentType(file.Name, out var contentType))
        {
            contentType = "application/octet-stream";
        }

        return File(content, contentType, file.Name);
    }

    [HttpPut("{id:guid}/rename")]
    public async Task<ActionResult<FileResponse>> Rename(
        Guid id,
        [FromBody] RenameFileRequest request
    )
    {
        var file = await fileRepository.GetByIdAsync(id);
        if (file is null)
            return NotFound();
        if (
            !await permissionService.CanEditAsync(
                ShareResourceType.File,
                file.Id,
                file.OrganizationId
            )
        )
            return Forbid();

        file.Rename(request.Name);
        await fileRepository.SaveChangesAsync();
        await activityLogger.LogAsync(
            ActivityAction.Renamed,
            ActivityResourceType.File,
            file.Id,
            file.Name
        );
        return Ok(ToResponse(file));
    }

    [HttpPut("{id:guid}/move")]
    public async Task<ActionResult<FileResponse>> Move(Guid id, [FromBody] MoveFileRequest request)
    {
        var file = await fileRepository.GetByIdAsync(id);
        if (file is null)
            return NotFound();
        if (
            !await permissionService.CanEditAsync(
                ShareResourceType.File,
                file.Id,
                file.OrganizationId
            )
        )
            return Forbid();

        file.MoveTo(request.NewFolderId);
        await fileRepository.SaveChangesAsync();
        await activityLogger.LogAsync(
            ActivityAction.Moved,
            ActivityResourceType.File,
            file.Id,
            file.Name
        );
        return Ok(ToResponse(file));
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Delete(Guid id)
    {
        var file = await fileRepository.GetByIdAsync(id);
        if (file is null)
            return NotFound();
        if (
            !await permissionService.CanEditAsync(
                ShareResourceType.File,
                file.Id,
                file.OrganizationId
            )
        )
            return Forbid();

        file.Delete();
        await fileRepository.SaveChangesAsync();
        await activityLogger.LogAsync(
            ActivityAction.Deleted,
            ActivityResourceType.File,
            file.Id,
            file.Name
        );
        return NoContent();
    }

    [HttpPut("{id:guid}/restore")]
    public async Task<ActionResult<FileResponse>> Restore(Guid id)
    {
        var file = await fileRepository.GetDeletedByIdAsync(id);
        if (file is null)
            return NotFound();

        file.Restore();
        await fileRepository.SaveChangesAsync();
        await activityLogger.LogAsync(
            ActivityAction.Restored,
            ActivityResourceType.File,
            file.Id,
            file.Name
        );
        return Ok(ToResponse(file));
    }

    [HttpDelete("{id:guid}/permanent")]
    public async Task<IActionResult> DeletePermanent(Guid id)
    {
        var file = await fileRepository.GetDeletedByIdAsync(id);
        if (file is null)
            return NotFound();

        foreach (var version in file.Versions)
        {
            await blobStorageService.DeleteAsync(version.BlobPath);
        }
        await fileRepository.DeletePermanentAsync(file);
        return NoContent();
    }

    [HttpPut("{id:guid}/star")]
    public async Task<ActionResult<FileResponse>> Star(Guid id)
    {
        var file = await fileRepository.GetByIdAsync(id);
        if (file is null)
            return NotFound();
        if (
            !await permissionService.CanEditAsync(
                ShareResourceType.File,
                file.Id,
                file.OrganizationId
            )
        )
            return Forbid();

        file.Star();
        await fileRepository.SaveChangesAsync();
        await activityLogger.LogAsync(
            ActivityAction.Starred,
            ActivityResourceType.File,
            file.Id,
            file.Name
        );
        return Ok(ToResponse(file));
    }

    [HttpPut("{id:guid}/unstar")]
    public async Task<ActionResult<FileResponse>> Unstar(Guid id)
    {
        var file = await fileRepository.GetByIdAsync(id);
        if (file is null)
            return NotFound();
        if (
            !await permissionService.CanEditAsync(
                ShareResourceType.File,
                file.Id,
                file.OrganizationId
            )
        )
            return Forbid();

        file.Unstar();
        await fileRepository.SaveChangesAsync();
        await activityLogger.LogAsync(
            ActivityAction.Unstarred,
            ActivityResourceType.File,
            file.Id,
            file.Name
        );
        return Ok(ToResponse(file));
    }

    [HttpPost("{id:guid}/share")]
    public async Task<ActionResult<ShareResponse>> Share(
        Guid id,
        [FromBody] CreateShareRequest request
    )
    {
        var file = await fileRepository.GetByIdAsync(id);
        if (file is null)
            return NotFound();

        var recipient = await userRepository.GetByEmailAsync(request.RecipientEmail);
        if (recipient is null)
            return BadRequest("No user found with that email.");

        if (
            !Enum.TryParse<SharePermission>(
                request.Permission,
                ignoreCase: true,
                out var permission
            )
        )
        {
            return BadRequest("Permission must be 'Viewer' or 'Editor'.");
        }

        var share = new Share(
            ShareResourceType.File,
            file.Id,
            currentUserProvider.UserId,
            recipient.Id,
            permission
        );
        await shareRepository.AddAsync(share);
        await activityLogger.LogAsync(
            ActivityAction.Shared,
            ActivityResourceType.File,
            file.Id,
            file.Name
        );

        return Ok(
            new ShareResponse(
                share.Id,
                file.Id,
                "File",
                request.RecipientEmail,
                permission.ToString(),
                share.CreatedAt
            )
        );
    }

    private static FileResponse ToResponse(DriveFile file) =>
        new(
            file.Id,
            file.Name,
            file.FolderId,
            file.Size,
            file.ContentHash,
            file.CreatedAt,
            file.ModifiedAt,
            file.DeletedAt,
            file.IsStarred
        );
}
