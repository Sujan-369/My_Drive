namespace My_Drive.Core.Entities;

public enum ShareResourceType
{
    Folder,
    File,
}

public enum SharePermission
{
    Viewer,
    Editor,
}

public sealed class Share
{
    public Guid Id { get; private set; }
    public ShareResourceType ResourceType { get; private set; }
    public Guid ResourceId { get; private set; }
    public Guid SharedByUserId { get; private set; }
    public Guid SharedWithUserId { get; private set; }
    public SharePermission Permission { get; private set; }
    public DateTime CreatedAt { get; private set; }
    public DateTime? ExpiresAt { get; private set; }

    public bool IsExpired => ExpiresAt is not null && ExpiresAt < DateTime.UtcNow;

    private Share() { }

    public Share(
        ShareResourceType resourceType,
        Guid resourceId,
        Guid sharedByUserId,
        Guid sharedWithUserId,
        SharePermission permission,
        DateTime? expiresAt = null
    )
    {
        if (resourceId == Guid.Empty)
        {
            throw new ArgumentException(
                "Share must reference a valid resource.",
                nameof(resourceId)
            );
        }
        if (sharedByUserId == Guid.Empty)
        {
            throw new ArgumentException("Share must have a valid sharer.", nameof(sharedByUserId));
        }
        if (sharedWithUserId == Guid.Empty)
        {
            throw new ArgumentException(
                "Share must have a valid recipient.",
                nameof(sharedWithUserId)
            );
        }
        if (sharedByUserId == sharedWithUserId)
        {
            throw new InvalidOperationException("Cannot share a resource with yourself.");
        }

        Id = Guid.NewGuid();
        ResourceType = resourceType;
        ResourceId = resourceId;
        SharedByUserId = sharedByUserId;
        SharedWithUserId = sharedWithUserId;
        Permission = permission;
        CreatedAt = DateTime.UtcNow;
        ExpiresAt = expiresAt;
    }
}
