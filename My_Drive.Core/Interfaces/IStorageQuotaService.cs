using My_Drive.Core.Models;

namespace My_Drive.Core.Interfaces;

public interface IStorageQuotaService
{
    /// <summary>Would adding this many bytes keep the caller's org under its limit?</summary>
    Task<ServiceResult> EnsureCapacityAsync(long incomingBytes);
}