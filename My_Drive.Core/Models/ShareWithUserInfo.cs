using My_Drive.Core.Entities;

namespace My_Drive.Core.Models;

public sealed record ShareWithUserInfo(
    Guid ShareId,
    Guid UserId,
    string DisplayName,
    string Email,
    string? PictureUrl,
    SharePermission Permission,
    DateTime SharedAt
);
