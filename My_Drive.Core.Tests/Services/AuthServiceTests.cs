using My_Drive.Core.Entities;
using My_Drive.Core.Interfaces;
using My_Drive.Core.Models;
using My_Drive.Core.Services;
using Xunit;

namespace My_Drive.Core.Tests.Services;

public class AuthServiceTests
{
    [Fact]
    public async Task SignIn_FirstTimeUser_CreatesOneOrganizationAndOneUser()
    {
        var tokenValidator = new FakeTokenValidator(new GoogleIdentity("sub-123", "a@b.com", "Alice"));
        var userRepo = new FakeUserRepository();
        var orgRepo = new FakeOrganizationRepository();
        var sut = new AuthService(tokenValidator, userRepo, orgRepo);

        var user = await sut.SignInWithGoogleAsync("fake-token");

        Assert.Single(orgRepo.Saved);
        Assert.Single(userRepo.Saved);
        Assert.Equal(orgRepo.Saved[0].Id, user.OrganizationId);
    }

    [Fact]
    public async Task SignIn_ReturningUser_DoesNotCreateDuplicate()
    {
        var identity = new GoogleIdentity("sub-123", "a@b.com", "Alice");
        var tokenValidator = new FakeTokenValidator(identity);
        var userRepo = new FakeUserRepository();
        var orgRepo = new FakeOrganizationRepository();
        var sut = new AuthService(tokenValidator, userRepo, orgRepo);

        var first = await sut.SignInWithGoogleAsync("fake-token");
        var second = await sut.SignInWithGoogleAsync("fake-token");

        Assert.Single(orgRepo.Saved);
        Assert.Single(userRepo.Saved);
        Assert.Equal(first.Id, second.Id);
    }

    [Fact]
    public async Task SignIn_InvalidToken_Throws()
    {
        var tokenValidator = new FakeTokenValidator(null);
        var sut = new AuthService(tokenValidator, new FakeUserRepository(), new FakeOrganizationRepository());

        await Assert.ThrowsAsync<InvalidOperationException>(() => sut.SignInWithGoogleAsync("bad-token"));
    }

    private sealed class FakeTokenValidator(GoogleIdentity? identity) : IGoogleTokenValidator
    {
        public Task<GoogleIdentity?> ValidateAsync(string idToken) => Task.FromResult(identity);
    }

    private sealed class FakeUserRepository : IUserRepository
    {
        public List<User> Saved { get; } = [];
        public Task<User?> GetByGoogleSubjectIdAsync(string googleSubjectId) =>
            Task.FromResult(Saved.FirstOrDefault(u => u.GoogleSubjectId == googleSubjectId));
        public Task AddAsync(User user)
        {
            Saved.Add(user);
            return Task.CompletedTask;
        }
    }

    private sealed class FakeOrganizationRepository : IOrganizationRepository
    {
        public List<Organization> Saved { get; } = [];
        public Task AddAsync(Organization organization)
        {
            Saved.Add(organization);
            return Task.CompletedTask;
        }
    }
}