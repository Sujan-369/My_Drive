using Microsoft.AspNetCore.Mvc;
using My_Drive.Contracts.Search;
using My_Drive.Core.Interfaces;

namespace My_Drive.Controllers;

[ApiController]
[Route("api/search")]
public sealed class SearchController(
    IFolderRepository folderRepository,
    IFileRepository fileRepository
) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<IReadOnlyList<SearchResultResponse>>> Search(
        [FromQuery] string q
    )
    {
        if (string.IsNullOrWhiteSpace(q))
        {
            return Ok(Array.Empty<SearchResultResponse>());
        }

        var folders = await folderRepository.SearchAsync(q);
        var files = await fileRepository.SearchAsync(q);

        var results = folders
            .Select(f => new SearchResultResponse(
                f.Id,
                f.Name,
                "Folder",
                f.ParentFolderId,
                f.ModifiedAt,
                null
            ))
            .Concat(
                files.Select(f => new SearchResultResponse(
                    f.Id,
                    f.Name,
                    "File",
                    f.FolderId,
                    f.ModifiedAt,
                    f.Size
                ))
            )
            .OrderByDescending(r => r.ModifiedAt)
            .ToList();

        return Ok(results);
    }
}
