using My_Drive.Core.Entities;

namespace My_Drive.Core.Interfaces;

public interface IActivityLogger
{
    Task LogAsync(ActivityAction action, ActivityResourceType resourceType, Guid resourceId, string resourceName);
}