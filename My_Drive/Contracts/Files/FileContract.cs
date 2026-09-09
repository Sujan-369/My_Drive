namespace My_Drive.Contracts.Files;

public sealed class UploadFileRequest
{
    public required IFormFile File { get; init; }
    public Guid? FolderId { get; init; }
}

public sealed record FileResponse(Guid Id, string Name, Guid? FolderId, long Size, string ContentHash, DateTime CreatedAt, DateTime ModifiedAt, DateTime? DeletedAt, bool IsStarred);
public sealed record RenameFileRequest(string Name);
public sealed record MoveFileRequest(Guid? NewFolderId);