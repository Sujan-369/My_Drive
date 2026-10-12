using My_Drive.Core.Entities;
using My_Drive.Core.Interfaces;
using My_Drive.Core.Models;
using My_Drive.Core.Services;
using Xunit;

namespace My_Drive.Core.Tests.Services;

public class ShareServiceTests
{
    private static readonly Guid SharerId = Guid.NewGuid();
    private static readonly Guid ResourceId = Guid.NewGuid();

    private readonly FakeShareRepository _shares = new();
    private readonly FakeUserRepository _users = new();
    private readonly FakeActivityLogger _log = new();
    private readonly User _recipient = new(Guid.NewGuid(), "bob@example.com", "Bob", "sub-bob");

    public ShareServiceTests() => _users.ByEmail[_recipient.Email] = _recipient;

    private ShareService CreateSut() => new(_shares, _users, new FakeCurrentUser(), _log);

    private Task<ShareGrantResult> Grant(string permission, string email = "bob@example.com") =>
        CreateSut().GrantAsync(ShareResourceType.File, ResourceId, "a.pdf", email, permission);

    [Fact]
    public async Task NewShare_IsChangedWithNoPreviousPermission()
    {
        var result = await Grant("Viewer");

        Assert.True(result.Outcome.IsOk);
        Assert.True(result.Changed);
        Assert.Null(result.PreviousPermission);
        Assert.Single(_shares.Items);
        Assert.Equal(1, _log.Count);
    }

    [Fact]
    public async Task SamePermissionAgain_IsUnchangedAndNotLogged()
    {
        await Grant("Viewer");
        var second = await Grant("Viewer");

        Assert.True(second.Outcome.IsOk);
        Assert.False(second.Changed);
        Assert.Single(_shares.Items);
        Assert.Equal(1, _log.Count);
    }

    [Fact]
    public async Task DifferentPermission_UpdatesInPlace()
    {
        await Grant("Viewer");
        var second = await Grant("Editor");

        Assert.True(second.Changed);
        Assert.Equal(SharePermission.Viewer, second.PreviousPermission);
        Assert.Single(_shares.Items);
        Assert.Equal(SharePermission.Editor, _shares.Items[0].Permission);
    }

    [Fact]
    public async Task ExpiredShareWithSamePermission_IsRevived()
    {
        _shares.Items.Add(
            new Share(
                ShareResourceType.File,
                ResourceId,
                SharerId,
                _recipient.Id,
                SharePermission.Viewer,
                DateTime.UtcNow.AddDays(-1)
            )
        );

        var result = await Grant("Viewer");

        Assert.True(result.Changed);
        Assert.False(_shares.Items[0].IsExpired);
    }

    [Fact]
    public async Task UnknownEmail_IsInvalid()
    {
        var result = await Grant("Viewer", "nobody@example.com");
        Assert.Equal(ServiceStatus.Invalid, result.Outcome.Status);
    }

    [Theory]
    [InlineData("7")]
    [InlineData("Owner")]
    [InlineData("")]
    public async Task InvalidPermission_IsInvalid(string permission)
    {
        var result = await Grant(permission);
        Assert.Equal(ServiceStatus.Invalid, result.Outcome.Status);
    }

    private sealed class FakeCurrentUser : ICurrentUserProvider
    {
        public Guid UserId => SharerId;
    }

    private sealed class FakeActivityLogger : IActivityLogger
    {
        public int Count { get; private set; }

        public Task LogAsync(
            ActivityAction action,
            ActivityResourceType resourceType,
            Guid resourceId,
            string resourceName
        )
        {
            Count++;
            return Task.CompletedTask;
        }
    }

    private sealed class FakeUserRepository : IUserRepository
    {
        public Dictionary<string, User> ByEmail { get; } = [];

        public Task<User?> GetByEmailAsync(string email) =>
            Task.FromResult(ByEmail.GetValueOrDefault(email));

        public Task<User?> GetByGoogleSubjectIdAsync(string googleSubjectId) =>
            throw new NotSupportedException();

        public Task AddAsync(User user) => throw new NotSupportedException();

        public Task SaveChangesAsync() => throw new NotSupportedException();

        public Task<User?> GetByIdAsync(Guid id) => throw new NotSupportedException();
    }

    private sealed class FakeShareRepository : IShareRepository
    {
        public List<Share> Items { get; } = [];

        public Task AddAsync(Share share)
        {
            Items.Add(share);
            return Task.CompletedTask;
        }

        public Task<Share?> GetAsync(ShareResourceType type, Guid resourceId, Guid userId) =>
            Task.FromResult(
                Items.FirstOrDefault(s =>
                    s.ResourceType == type
                    && s.ResourceId == resourceId
                    && s.SharedWithUserId == userId
                )
            );

        public Task SaveChangesAsync() => Task.CompletedTask;

        public Task<IReadOnlyList<SharedResourceInfo>> GetSharedWithMeAsync(Guid userId) =>
            throw new NotSupportedException();

        public Task<HashSet<Guid>> GetSharedResourceIdsAsync(
            Guid sharedByUserId,
            ShareResourceType resourceType
        ) => throw new NotSupportedException();

        public Task<IReadOnlyList<ShareWithUserInfo>> GetSharesForResourceAsync(
            ShareResourceType resourceType,
            Guid resourceId
        ) => throw new NotSupportedException();
    }
}