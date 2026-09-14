namespace My_Drive.Contracts.Auth;

public sealed record AuthResponse(
    string Token,
    Guid UserId,
    Guid OrganizationId,
    string Email,
    string DisplayName,
    string? PictureUrl
);

public sealed record CurrentUserResponse(Guid UserId, Guid OrganizationId, string Email, string DisplayName, string? PictureUrl);
