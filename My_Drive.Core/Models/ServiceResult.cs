namespace My_Drive.Core.Models;

public enum ServiceStatus
{
    Ok,
    Invalid,
    Forbidden,
}

public sealed record ServiceResult(ServiceStatus Status, string? Message = null)
{
    public bool IsOk => Status == ServiceStatus.Ok;

    public static ServiceResult Ok() => new(ServiceStatus.Ok);

    public static ServiceResult Invalid(string message) => new(ServiceStatus.Invalid, message);

    public static ServiceResult Forbidden(string? message = null) =>
        new(ServiceStatus.Forbidden, message);
}