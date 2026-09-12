using My_Drive.Core.Entities;
using My_Drive.Core.Interfaces;
using My_Drive.Infrastructure.Data;

namespace My_Drive.Infrastructure.Repositories;

public sealed class ShareRepository(ApplicationDbContext dbContext) : IShareRepository
{
    public async Task AddAsync(Share share)
    {
        dbContext.Shares.Add(share);
        await dbContext.SaveChangesAsync();
    }
}
