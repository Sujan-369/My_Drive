using My_Drive.Core.Entities;
using My_Drive.Core.Interfaces;

namespace My_Drive.Infrastructure.Services;

public sealed class ActivityLogger(
    IActivityLogRepository activityLogRepository,
    ICurrentOrganizationProvider currentOrganizationProvider,
    ICurrentUserProvider currentUserProvider) : IActivityLogger
{
    public async Task LogAsync(ActivityAction action, ActivityResourceType resourceType, Guid resourceId, string resourceName)
    {
        var log = new ActivityLog(
            currentOrganizationProvider.OrganizationId,
            currentUserProvider.UserId,
            action,
            resourceType,
            resourceId,
            resourceName);
        await activityLogRepository.AddAsync(log);
    }
}