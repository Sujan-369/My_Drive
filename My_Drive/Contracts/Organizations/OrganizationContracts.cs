namespace My_Drive.Contracts.Organizations;

public sealed record StorageUsageResponse(long TotalBytes, long LimitBytes);

public sealed record UploadPolicyResponse(long MaxFileBytes, IReadOnlyList<string> BlockedExtensions);