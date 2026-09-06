namespace My_Drive.Core.Entities;

public sealed class FileVersion
{
    public Guid Id { get; private set; }
    public Guid FileId { get; private set; }
    public string BlobPath { get; private set; } = null!;
    public long Size { get; private set; }
    public DateTime CreatedAt { get; private set; }

    private FileVersion() { }

    internal FileVersion(Guid fileId, string blobPath, long size)
    {
        Id = Guid.NewGuid();
        FileId = fileId;
        BlobPath = blobPath;
        Size = size;
        CreatedAt = DateTime.UtcNow;
    }
}