using Microsoft.AspNetCore.Mvc;
using My_Drive.Contracts.Sharing;
using My_Drive.Core.Models;

namespace My_Drive.Controllers;

internal static class ServiceResultExtensions
{
    public static ActionResult ToFailure(this ControllerBase controller, ServiceResult result) =>
        result.Status switch
        {
            ServiceStatus.Invalid => controller.BadRequest(new { message = result.Message }),
            ServiceStatus.Forbidden => controller.StatusCode(
                StatusCodes.Status403Forbidden,
                new { message = result.Message ?? "You don't have permission to do that." }
            ),
            ServiceStatus.QuotaExceeded => controller.StatusCode(
                StatusCodes.Status413PayloadTooLarge,
                new { message = result.Message }
            ),
            _ => controller.StatusCode(StatusCodes.Status500InternalServerError),
        };

    public static ShareResponse ToResponse(this ShareGrantResult grant, string recipientEmail) =>
        new(
            grant.Share!.Id,
            grant.Share.ResourceId,
            grant.Share.ResourceType.ToString(),
            recipientEmail,
            grant.Share.Permission.ToString(),
            grant.Share.CreatedAt,
            grant.Changed,
            grant.PreviousPermission?.ToString()
        );
}