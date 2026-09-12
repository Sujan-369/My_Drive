using My_Drive.Core.Entities;

namespace My_Drive.Core.Interfaces;

public interface IPermissionService
{
    Task<bool> CanEditAsync(
        ShareResourceType resourceType,
        Guid resourceId,
        Guid resourceOrganizationId
    );
}
