using Microsoft.EntityFrameworkCore;
using My_Drive.Core.Entities;
using My_Drive.Core.Interfaces;
using My_Drive.Infrastructure.Data;

namespace My_Drive.Infrastructure.Services;

public sealed class PermissionService(
    ApplicationDbContext dbContext,
    ICurrentOrganizationProvider currentOrganizationProvider,
    ICurrentUserProvider currentUserProvider
) : IPermissionService
{
    public async Task<bool> CanEditAsync(
        ShareResourceType resourceType,
        Guid resourceId,
        Guid resourceOrganizationId
    )
    {
        // Owning org always has full rights — this is the "Owner" tier,
        // above Editor, never gated by a Share row at all.
        if (resourceOrganizationId == currentOrganizationProvider.OrganizationId)
        {
            return true;
        }

        // Otherwise, only an Editor-level grant allows a write action.
        return await dbContext.Shares.AnyAsync(s =>
            s.ResourceType == resourceType
            && s.ResourceId == resourceId
            && s.SharedWithUserId == currentUserProvider.UserId
            && s.Permission == SharePermission.Editor
            && (s.ExpiresAt == null || s.ExpiresAt > DateTime.UtcNow)
        );
    }

    // Only the owning org can grant access. Editors can modify content but cannot
    // widen who has access. To follow Google Drive's default (editors can share),
    // change this to `return CanEditAsync(resourceType, resourceId, resourceOrganizationId);`
    public Task<bool> CanShareAsync(
        ShareResourceType resourceType,
        Guid resourceId,
        Guid resourceOrganizationId
    ) => Task.FromResult(resourceOrganizationId == currentOrganizationProvider.OrganizationId);
}
