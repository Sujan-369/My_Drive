namespace My_Drive.Contracts.Search;

public sealed record SearchResultResponse(
    Guid Id,
    string Name,
    string Type,
    Guid? ParentId,
    DateTime ModifiedAt,
    long? Size
);
