namespace My_Drive.Core.Entities;

public sealed class Folder
{
    public Guid Id { get; private set; }
    public Guid OrganizationId { get; private set; }
    public Guid OwnerId { get; private set; }
    public Guid? ParentFolderId { get; private set; }
    public string Name { get; private set; } = null!;
    public DateTime CreatedAt { get; private set; }
    public DateTime ModifiedAt { get; private set; }

    private Folder() { }

    public Folder(Guid organizationId, Guid ownerId, string name, Guid? parentFolderId = null)
    {
        if (organizationId == Guid.Empty)
        {
            throw new ArgumentException("Folder must belong to a valid Organization.", nameof(organizationId));
        }
        if (ownerId == Guid.Empty)
        {
            throw new ArgumentException("Folder must have a valid owner.", nameof(ownerId));
        }
        if (string.IsNullOrWhiteSpace(name))
        {
            throw new ArgumentException("Folder name cannot be empty.", nameof(name));
        }

        Id = Guid.NewGuid();
        OrganizationId = organizationId;
        OwnerId = ownerId;
        Name = name;
        ParentFolderId = parentFolderId;
        CreatedAt = DateTime.UtcNow;
        ModifiedAt = CreatedAt;
    }

    public void Rename(string newName)
    {
        if (string.IsNullOrWhiteSpace(newName))
        {
            throw new ArgumentException("Folder name cannot be empty.", nameof(newName));
        }

        Name = newName;
        ModifiedAt = DateTime.UtcNow;
    }

    public void MoveTo(Guid? newParentFolderId)
    {
        if (newParentFolderId == Id)
        {
            throw new InvalidOperationException("A folder cannot be its own parent.");
        }

        ParentFolderId = newParentFolderId;
        ModifiedAt = DateTime.UtcNow;
    }
}