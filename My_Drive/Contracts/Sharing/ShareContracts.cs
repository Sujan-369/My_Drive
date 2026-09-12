namespace My_Drive.Contracts.Sharing;

public sealed record CreateShareRequest(string RecipientEmail, string Permission);

public sealed record ShareResponse(
    Guid Id,
    Guid ResourceId,
    string ResourceType,
    string RecipientEmail,
    string Permission,
    DateTime CreatedAt
);

public sealed record SharedWithMeResponse(
    Guid ShareId,
    Guid ResourceId,
    string ResourceType,
    string ResourceName,
    string SharedByName,
    string SharedByEmail,
    string Permission,
    DateTime SharedAt
);
