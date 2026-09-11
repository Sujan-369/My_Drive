namespace My_Drive.Contracts.Activity;

public sealed record ActivityLogResponse(
    Guid Id,
    string Action,
    string ResourceType,
    Guid ResourceId,
    string ResourceName,
    DateTime CreatedAt
);
