using My_Drive.Core.Entities;
using My_Drive.Core.Models;

namespace My_Drive.Core.Interfaces;

public interface IShareService
{
    Task<ShareGrantResult> GrantAsync(
        ShareResourceType resourceType,
        Guid resourceId,
        string resourceName,
        string recipientEmail,
        string permissionName
    );
}