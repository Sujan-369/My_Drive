using My_Drive.Core.Entities;

namespace My_Drive.Core.Models;

public sealed record SharedResourceInfo(
    Guid ShareId,
    ShareResourceType ResourceType,
    Guid ResourceId,
    string ResourceName,
    string SharedByEmail,
    string SharedByName,
    SharePermission Permission,
    DateTime SharedAt
);
