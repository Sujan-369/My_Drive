namespace My_Drive.Core.Entities;

public sealed class DriveFile
{
    private readonly List<FileVersion> _versions = [];

    public Guid Id { get; private set; }
    public Guid OrganizationId { get; private set; }
    public Guid? FolderId { get; private set; }
    public Guid OwnerId { get; private set; }
    public string Name { get; private set; } = null!;
    public string ContentHash { get; private set; } = null!;
    public long Size { get; private set; }
    public Guid CurrentVersionId { get; private set; }
    public DateTime CreatedAt { get; private set; }
    public DateTime ModifiedAt { get; private set; }
    public bool IsDeleted { get; private set; }
    public DateTime? DeletedAt { get; private set; }
    public bool IsStarred { get; private set; }

    public IReadOnlyList<FileVersion> Versions => _versions;

    private DriveFile() { }

    public DriveFile(Guid organizationId, Guid ownerId, string name, Guid? folderId, string blobPath, long size, string contentHash)
    {
        if (organizationId == Guid.Empty)
        {
            throw new ArgumentException("File must belong to a valid Organization.", nameof(organizationId));
        }
        if (ownerId == Guid.Empty)
        {
            throw new ArgumentException("File must have a valid owner.", nameof(ownerId));
        }
        if (string.IsNullOrWhiteSpace(name))
        {
            throw new ArgumentException("File name cannot be empty.", nameof(name));
        }
        if (size < 0)
        {
            throw new ArgumentException("File size cannot be negative.", nameof(size));
        }

        Id = Guid.NewGuid();
        OrganizationId = organizationId;
        OwnerId = ownerId;
        Name = name;
        FolderId = folderId;
        CreatedAt = DateTime.UtcNow;
        ModifiedAt = CreatedAt;

        var initialVersion = new FileVersion(Id, blobPath, size);
        _versions.Add(initialVersion);
        CurrentVersionId = initialVersion.Id;
        Size = size;
        ContentHash = contentHash;
    }

    public void AddVersion(string blobPath, long size, string contentHash)
    {
        if (size < 0)
        {
            throw new ArgumentException("File size cannot be negative.", nameof(size));
        }

        var version = new FileVersion(Id, blobPath, size);
        _versions.Add(version);
        CurrentVersionId = version.Id;
        Size = size;
        ContentHash = contentHash;
        ModifiedAt = DateTime.UtcNow;
    }

    public void Rename(string newName)
    {
        if (string.IsNullOrWhiteSpace(newName))
        {
            throw new ArgumentException("File name cannot be empty.", nameof(newName));
        }

        Name = newName;
        ModifiedAt = DateTime.UtcNow;
    }

    public void MoveTo(Guid? newFolderId)
    {
        FolderId = newFolderId;
        ModifiedAt = DateTime.UtcNow;
    }

    public void Delete()
    {
        IsDeleted = true;
        DeletedAt = DateTime.UtcNow;
    }

    public void Restore()
    {
        IsDeleted = false;
        DeletedAt = null;
    }

    public void Star() => IsStarred = true;

    public void Unstar() => IsStarred = false;
}