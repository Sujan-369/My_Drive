using My_Drive.Core.Entities;

namespace My_Drive.Core.Interfaces;

public interface IUserRepository
{
    Task<User?> GetByGoogleSubjectIdAsync(string googleSubjectId);
    Task AddAsync(User user);
}