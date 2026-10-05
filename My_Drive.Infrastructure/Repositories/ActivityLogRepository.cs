using Microsoft.EntityFrameworkCore;
using My_Drive.Core.Entities;
using My_Drive.Core.Interfaces;
using My_Drive.Infrastructure.Data;

namespace My_Drive.Infrastructure.Repositories;

public sealed class ActivityLogRepository(ApplicationDbContext dbContext) : IActivityLogRepository
{
    public async Task AddAsync(ActivityLog log)
    {
        dbContext.ActivityLogs.Add(log);
        await dbContext.SaveChangesAsync();
    }

    public async Task<IReadOnlyList<ActivityLog>> GetRecentAsync(int take, DateTime? after)
    {
        var query = dbContext.ActivityLogs.AsQueryable();
        if (after is not null)
        {
            query = query.Where(l => l.CreatedAt > after);
        }
        return await query.OrderByDescending(l => l.CreatedAt).Take(take).ToListAsync();
    }
}
