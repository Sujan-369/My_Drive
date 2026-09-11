using Microsoft.AspNetCore.Mvc;
using My_Drive.Contracts.Activity;
using My_Drive.Core.Interfaces;

namespace My_Drive.Controllers;

[ApiController]
[Route("api/activity")]
public sealed class ActivityController(IActivityLogRepository activityLogRepository)
    : ControllerBase
{
    [HttpGet("recent")]
    public async Task<ActionResult<IReadOnlyList<ActivityLogResponse>>> GetRecent(
        [FromQuery] int take = 20
    )
    {
        var logs = await activityLogRepository.GetRecentAsync(take);
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
