using My_Drive.Core.Entities;

namespace My_Drive.Core.Interfaces;

public interface IAuthService
{
    Task<User> SignInWithGoogleAsync(string googleIdToken);
}