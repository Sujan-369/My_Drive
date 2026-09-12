using Microsoft.EntityFrameworkCore;
using My_Drive.Core.Entities;
using My_Drive.Core.Interfaces;
using My_Drive.Infrastructure.Data;

namespace My_Drive.Infrastructure.Repositories;

public sealed class UserRepository(ApplicationDbContext dbContext) : IUserRepository
{
    public async Task<User?> GetByGoogleSubjectIdAsync(string googleSubjectId) =>
        await dbContext
            .Users.IgnoreQueryFilters() // no org context exists yet — we're looking a user UP, not scoping within one
            .FirstOrDefaultAsync(u => u.GoogleSubjectId == googleSubjectId);

    public async Task AddAsync(User user)
    {
        dbContext.Users.Add(user);
        await dbContext.SaveChangesAsync();
    }

    public async Task<User?> GetByEmailAsync(string email) =>
        await dbContext.Users.IgnoreQueryFilters().FirstOrDefaultAsync(u => u.Email == email);
}
