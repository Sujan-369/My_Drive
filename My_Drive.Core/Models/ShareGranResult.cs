using My_Drive.Core.Entities;

namespace My_Drive.Core.Models;

public sealed record ShareGrantResult(
    ServiceResult Outcome,
    Share? Share = null,
    bool Changed = false,
    SharePermission? PreviousPermission = null
);