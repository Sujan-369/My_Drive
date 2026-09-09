using System.Security.Cryptography;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.StaticFiles;
using My_Drive.Contracts.Files;
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
    ICurrentUserProvider currentUserProvider) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<IReadOnlyList<FileResponse>>> GetByFolder([FromQuery] Guid? folderId)
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

        var file = new DriveFile(orgId, currentUserProvider.UserId, request.File.FileName, request.FolderId, blobPath, request.File.Length, contentHash);
        await fileRepository.AddAsync(file);

        return CreatedAtAction(nameof(GetById), new { id = file.Id }, ToResponse(file));
    }

    [HttpGet("{id:guid}/download")]
    public async Task<IActionResult> Download(Guid id)
    {
        var file = await fileRepository.GetByIdAsync(id);
        if (file is null) return NotFound();

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
    public async Task<ActionResult<FileResponse>> Rename(Guid id, [FromBody] RenameFileRequest request)
    {
        var file = await fileRepository.GetByIdAsync(id);
        if (file is null) return NotFound();

        file.Rename(request.Name);
        await fileRepository.SaveChangesAsync();
        return Ok(ToResponse(file));
    }

    [HttpPut("{id:guid}/move")]
    public async Task<ActionResult<FileResponse>> Move(Guid id, [FromBody] MoveFileRequest request)
    {
        var file = await fileRepository.GetByIdAsync(id);
        if (file is null) return NotFound();

        file.MoveTo(request.NewFolderId);
        await fileRepository.SaveChangesAsync();
        return Ok(ToResponse(file));
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Delete(Guid id)
    {
        var file = await fileRepository.GetByIdAsync(id);
        if (file is null) return NotFound();

        file.Delete();
        await fileRepository.SaveChangesAsync();
        return NoContent();
    }

    [HttpPut("{id:guid}/restore")]
    public async Task<ActionResult<FileResponse>> Restore(Guid id)
    {
        var file = await fileRepository.GetDeletedByIdAsync(id);
        if (file is null) return NotFound();

        file.Restore();
        await fileRepository.SaveChangesAsync();
        return Ok(ToResponse(file));
    }

    [HttpDelete("{id:guid}/permanent")]
    public async Task<IActionResult> DeletePermanent(Guid id)
    {
        var file = await fileRepository.GetDeletedByIdAsync(id);
        if (file is null) return NotFound();

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
        if (file is null) return NotFound();

        file.Star();
        await fileRepository.SaveChangesAsync();
        return Ok(ToResponse(file));
    }

    [HttpPut("{id:guid}/unstar")]
    public async Task<ActionResult<FileResponse>> Unstar(Guid id)
    {
        var file = await fileRepository.GetByIdAsync(id);
        if (file is null) return NotFound();

        file.Unstar();
        await fileRepository.SaveChangesAsync();
        return Ok(ToResponse(file));
    }

    private static FileResponse ToResponse(DriveFile file) =>
        new(file.Id, file.Name, file.FolderId, file.Size, file.ContentHash, file.CreatedAt, file.ModifiedAt, file.DeletedAt, file.IsStarred);
}