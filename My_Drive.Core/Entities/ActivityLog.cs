namespace My_Drive.Core.Entities;

public enum ActivityAction
{
    Created,
    Uploaded,
    Renamed,
    Moved,
    Deleted,
    Restored,
    Starred,
    Unstarred
}

public enum ActivityResourceType
{
    Folder,
    File
}

public sealed class ActivityLog
{
    public Guid Id { get; private set; }
    public Guid OrganizationId { get; private set; }
    public Guid ActorId { get; private set; }
    public ActivityAction Action { get; private set; }
    public ActivityResourceType ResourceType { get; private set; }
    public Guid ResourceId { get; private set; }
    public string ResourceName { get; private set; } = null!;
    public DateTime CreatedAt { get; private set; }

    private ActivityLog() { }

    public ActivityLog(Guid organizationId, Guid actorId, ActivityAction action, ActivityResourceType resourceType, Guid resourceId, string resourceName)
    {
        if (organizationId == Guid.Empty)
        {
            throw new ArgumentException("ActivityLog must belong to a valid Organization.", nameof(organizationId));
        }
        if (actorId == Guid.Empty)
        {
            throw new ArgumentException("ActivityLog must have a valid actor.", nameof(actorId));
        }
        if (string.IsNullOrWhiteSpace(resourceName))
        {
            throw new ArgumentException("Resource name cannot be empty.", nameof(resourceName));
        }

        Id = Guid.NewGuid();
        OrganizationId = organizationId;
        ActorId = actorId;
        Action = action;
        ResourceType = resourceType;
        ResourceId = resourceId;
        ResourceName = resourceName;
        CreatedAt = DateTime.UtcNow;
    }
}