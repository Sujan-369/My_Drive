using Microsoft.AspNetCore.Mvc;
using My_Drive.Contracts.Activity;
using My_Drive.Core.Interfaces;

namespace My_Drive.Controllers;

[ApiController]
[Route("api/activity")]
public sealed class ActivityController(
    IActivityLogRepository activityLogRepository,
    ICurrentUserProvider currentUserProvider,
    IUserRepository userRepository
) : ControllerBase
{
    [HttpGet("recent")]
    public async Task<ActionResult<IReadOnlyList<ActivityLogResponse>>> GetRecent(
        [FromQuery] int take = 20
    )
    {
        var user = await userRepository.GetByIdAsync(currentUserProvider.UserId);
        var logs = await activityLogRepository.GetRecentAsync(take, user?.LastRecentClearedAt);
        return Ok(
            logs.Select(l => new ActivityLogResponse(
                l.Id,
                l.Action.ToString(),
                l.ResourceType.ToString(),
                l.ResourceId,
                l.ResourceName,
                l.CreatedAt
            ))
        );
    }
}
