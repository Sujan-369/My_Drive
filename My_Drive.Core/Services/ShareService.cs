using My_Drive.Core.Entities;
using My_Drive.Core.Interfaces;
using My_Drive.Core.Models;

namespace My_Drive.Core.Services;

public sealed class ShareService(
    IShareRepository shareRepository,
    IUserRepository userRepository,
    ICurrentUserProvider currentUserProvider,
    IActivityLogger activityLogger
) : IShareService
{
    public async Task<ShareGrantResult> GrantAsync(
        ShareResourceType resourceType,
        Guid resourceId,
        string resourceName,
        string recipientEmail,
        string permissionName
    )
    {
        // Enum.TryParse accepts numeric strings ("7"), so also require a defined value.
        if (
            !Enum.TryParse<SharePermission>(permissionName, ignoreCase: true, out var permission)
            || !Enum.IsDefined(permission)
        )
        {
            return new(ServiceResult.Invalid("Permission must be 'Viewer' or 'Editor'."));
        }

        var recipient = await userRepository.GetByEmailAsync(recipientEmail);
        if (recipient is null)
            return new(ServiceResult.Invalid("No user found with that email."));

        var share = await shareRepository.GetAsync(resourceType, resourceId, recipient.Id);
        SharePermission? previous = null;
        var changed = true;

        if (share is null)
        {
            share = new Share(
                resourceType,
                resourceId,
                currentUserProvider.UserId,
                recipient.Id,
                permission
            );
            await shareRepository.AddAsync(share);
        }
        else
        {
            previous = share.Permission;
            // An expired grant counts as a change: re-granting revives it.
            changed = share.IsExpired || share.Permission != permission;
            if (changed)
            {
                share.UpdatePermission(permission);
                await shareRepository.SaveChangesAsync();
            }
        }

        if (changed)
        {
            await activityLogger.LogAsync(
                ActivityAction.Shared,
                resourceType == ShareResourceType.Folder
                    ? ActivityResourceType.Folder
                    : ActivityResourceType.File,
                resourceId,
                resourceName
            );
        }

        return new(ServiceResult.Ok(), share, changed, previous);
    }
}