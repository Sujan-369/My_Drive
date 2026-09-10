using My_Drive.Core.Entities;

namespace My_Drive.Core.Interfaces;

public interface IActivityLogRepository
{
    Task AddAsync(ActivityLog log);
    Task<IReadOnlyList<ActivityLog>> GetRecentAsync(int take);
}