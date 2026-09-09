namespace My_Drive.Contracts.Folders;

public sealed record CreateFolderRequest(string Name, Guid? ParentFolderId);
public sealed record RenameFolderRequest(string Name);
public sealed record MoveFolderRequest(Guid? NewParentFolderId);
public sealed record FolderResponse(Guid Id, string Name, Guid? ParentFolderId, DateTime CreatedAt, DateTime ModifiedAt, DateTime? DeletedAt, bool IsStarred);