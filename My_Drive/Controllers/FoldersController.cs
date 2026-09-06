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
    ICurrentUserProvider currentUserProvider) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<IReadOnlyList<FolderResponse>>> GetByParent([FromQuery] Guid? parentFolderId)
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

    [HttpPost]
    public async Task<ActionResult<FolderResponse>> Create([FromBody] CreateFolderRequest request)
    {
        var folder = new Folder(currentOrganizationProvider.OrganizationId, currentUserProvider.UserId, request.Name, request.ParentFolderId);
        await folderRepository.AddAsync(folder);
        return CreatedAtAction(nameof(GetById), new { id = folder.Id }, ToResponse(folder));
    }

    [HttpPut("{id:guid}/rename")]
    public async Task<ActionResult<FolderResponse>> Rename(Guid id, [FromBody] RenameFolderRequest request)
    {
        var folder = await folderRepository.GetByIdAsync(id);
        if (folder is null) return NotFound();

        folder.Rename(request.Name);
        await folderRepository.SaveChangesAsync();
        return Ok(ToResponse(folder));
    }

    [HttpPut("{id:guid}/move")]
    public async Task<ActionResult<FolderResponse>> Move(Guid id, [FromBody] MoveFolderRequest request)
    {
        var folder = await folderRepository.GetByIdAsync(id);
        if (folder is null) return NotFound();

        folder.MoveTo(request.NewParentFolderId);
        await folderRepository.SaveChangesAsync();
        return Ok(ToResponse(folder));
    }

    private static FolderResponse ToResponse(Folder folder) =>
        new(folder.Id, folder.Name, folder.ParentFolderId, folder.CreatedAt, folder.ModifiedAt);
}