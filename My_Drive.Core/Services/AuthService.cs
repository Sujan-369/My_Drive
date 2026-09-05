using My_Drive.Core.Entities;
using My_Drive.Core.Interfaces;

namespace My_Drive.Core.Services;

public sealed class AuthService(
    IGoogleTokenValidator tokenValidator,
    IUserRepository userRepository,
    IOrganizationRepository organizationRepository) : IAuthService
{
    public async Task<User> SignInWithGoogleAsync(string googleIdToken)
    {
        var identity = await tokenValidator.ValidateAsync(googleIdToken)
            ?? throw new InvalidOperationException("Invalid Google ID token.");

        var existingUser = await userRepository.GetByGoogleSubjectIdAsync(identity.Subject);
        if (existingUser is not null)
        {
            return existingUser;
        }

        var organization = new Organization($"{identity.DisplayName}'s Organization");
        await organizationRepository.AddAsync(organization);

        var newUser = new User(organization.Id, identity.Email, identity.DisplayName, identity.Subject);
        await userRepository.AddAsync(newUser);

        return newUser;
    }
}