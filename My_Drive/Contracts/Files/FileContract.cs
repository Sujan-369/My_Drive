namespace My_Drive.Contracts.Files;

public sealed class UploadFileRequest
{
    public required IFormFile File { get; init; }
    public Guid? FolderId { get; init; }
}

public sealed record FileResponse(
    Guid Id,
    string Name,
    Guid? FolderId,
    long Size,
    string ContentHash,
    DateTime CreatedAt,
    DateTime ModifiedAt,
    DateTime? DeletedAt,
    bool IsStarred,
    bool IsShared
);

public sealed record RenameFileRequest(string Name);

public sealed record MoveFileRequest(Guid? NewFolderId);

public sealed record ShareInfoResponse(
    Guid ShareId,
    Guid UserId,
    string DisplayName,
    string Email,
    string? PictureUrl,
    string Permission,
    DateTime SharedAt
);

public sealed record FileVersionResponse(Guid Id, long Size, DateTime CreatedAt);

public sealed record FileDetailResponse(
    Guid Id,
    string Name,
    Guid? FolderId,
    long Size,
    DateTime CreatedAt,
    DateTime ModifiedAt,
    bool IsStarred,
    IReadOnlyList<FileVersionResponse> Versions
);
