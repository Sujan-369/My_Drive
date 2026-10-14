namespace My_Drive.Core.Models;

public sealed record UploadPolicyOptions(long MaxFileBytes, IReadOnlySet<string> BlockedExtensions);