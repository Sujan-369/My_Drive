using Microsoft.AspNetCore.Mvc;
using My_Drive.Contracts.Sharing;
using My_Drive.Core.Interfaces;

namespace My_Drive.Controllers;

[ApiController]
[Route("api/shares")]
public sealed class SharesController(
    IShareRepository shareRepository,
    ICurrentUserProvider currentUserProvider
) : ControllerBase
{
    [HttpGet("shared-with-me")]
    public async Task<ActionResult<IReadOnlyList<SharedWithMeResponse>>> GetSharedWithMe()
    {
        var shares = await shareRepository.GetSharedWithMeAsync(currentUserProvider.UserId);
        return Ok(
            shares.Select(s => new SharedWithMeResponse(
                s.ShareId,
                s.ResourceId,
                s.ResourceType.ToString(),
                s.ResourceName,
                s.SharedByName,
                s.SharedByEmail,
                s.Permission.ToString(),
                s.SharedAt
            ))
        );
    }
}
