using Microsoft.AspNetCore.Mvc;
using My_Drive.Contracts.Organizations;
using My_Drive.Core.Interfaces;

namespace My_Drive.Controllers;

[ApiController]
[Route("api/organizations")]
public sealed class OrganizationsController(IFileRepository fileRepository) : ControllerBase
{
    [HttpGet("storage-usage")]
    public async Task<ActionResult<StorageUsageResponse>> GetStorageUsage()
    {
        var totalBytes = await fileRepository.GetTotalSizeAsync();
        return Ok(new StorageUsageResponse(totalBytes));
    }
}
