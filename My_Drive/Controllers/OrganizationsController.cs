using Microsoft.AspNetCore.Mvc;
using My_Drive.Contracts.Organizations;
using My_Drive.Core.Interfaces;
using My_Drive.Core.Services;

namespace My_Drive.Controllers;

[ApiController]
[Route("api/organizations")]
public sealed class OrganizationsController(
    IFileRepository fileRepository,
    StorageQuotaOptions quota,
    IUploadPolicy uploadPolicy
) : ControllerBase
{
    [HttpGet("storage-usage")]
    public async Task<ActionResult<StorageUsageResponse>> GetStorageUsage()
    {
        // Same measure the upload quota enforces, so the number never contradicts an error.
        var totalBytes = await fileRepository.GetTotalSizeIncludingTrashAsync();
        return Ok(new StorageUsageResponse(totalBytes, quota.LimitBytes));
    }

    [HttpGet("upload-policy")]
    public ActionResult<UploadPolicyResponse> GetUploadPolicy() =>
        Ok(
            new UploadPolicyResponse(
                uploadPolicy.Options.MaxFileBytes,
                [.. uploadPolicy.Options.BlockedExtensions.Order()]
            )
        );
}