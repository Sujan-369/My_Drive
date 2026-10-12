using My_Drive.Core.Entities;
using My_Drive.Core.Interfaces;
using My_Drive.Core.Models;
using My_Drive.Core.Services;
using Xunit;

namespace My_Drive.Core.Tests.Services;

public class FolderServiceTests
{
    private static readonly Guid OrgId = Guid.NewGuid();
    private static readonly Guid OtherOrgId = Guid.NewGuid();
    private static readonly Guid OwnerId = Guid.NewGuid();

    private readonly FakeFolderRepository _folders = new();
    private readonly FakePermissionService _permissions = new();

    private FolderService CreateSut() =>
        new(_folders, _permissions, new FakeOrganizationProvider());

    private Folder AddFolder(Guid orgId, string name, Guid? parentId = null)
    {
        var folder = new Folder(orgId, OwnerId, name, parentId);
        _folders.Items[folder.Id] = folder;
        return folder;
    }

    [Fact]
    public async Task Container_Root_IsOk()
    {
        var result = await CreateSut().ValidateContainerAsync(null);
        Assert.True(result.IsOk);
    }

    [Fact]
    public async Task Container_MissingFolder_IsInvalid()
    {
        var result = await CreateSut().ValidateContainerAsync(Guid.NewGuid());
        Assert.Equal(ServiceStatus.Invalid, result.Status);
    }

    [Fact]
    public async Task Container_OwnFolder_IsOk()
    {
        var folder = AddFolder(OrgId, "Docs");
        var result = await CreateSut().ValidateContainerAsync(folder.Id);
        Assert.True(result.IsOk);
    }

    [Fact]
    public async Task Container_WithoutEditRights_IsForbidden()
    {
        var folder = AddFolder(OrgId, "Docs");
        _permissions.CanEdit = false;

        var result = await CreateSut().ValidateContainerAsync(folder.Id);

        Assert.Equal(ServiceStatus.Forbidden, result.Status);
    }

    [Fact]
    public async Task Container_ForeignFolderEvenWithEditorGrant_IsInvalid()
    {
        var foreign = AddFolder(OtherOrgId, "Theirs");
        var result = await CreateSut().ValidateContainerAsync(foreign.Id);
        Assert.Equal(ServiceStatus.Invalid, result.Status);
    }

    [Fact]
    public async Task FolderMove_ToRoot_IsOk()
    {
        var folder = AddFolder(OrgId, "A");
        var result = await CreateSut().ValidateFolderMoveAsync(folder, null);
        Assert.True(result.IsOk);
    }

    [Fact]
    public async Task FolderMove_IntoItself_IsInvalid()
    {
        var folder = AddFolder(OrgId, "A");
        var result = await CreateSut().ValidateFolderMoveAsync(folder, folder.Id);
        Assert.Equal(ServiceStatus.Invalid, result.Status);
    }

    [Fact]
    public async Task FolderMove_IntoDescendant_IsInvalid()
    {
        var parent = AddFolder(OrgId, "Parent");
        var child = AddFolder(OrgId, "Child", parent.Id);
        var grandchild = AddFolder(OrgId, "Grandchild", child.Id);

        var result = await CreateSut().ValidateFolderMoveAsync(parent, grandchild.Id);

        Assert.Equal(ServiceStatus.Invalid, result.Status);
    }

    [Fact]
    public async Task FolderMove_IntoSibling_IsOk()
    {
        var a = AddFolder(OrgId, "A");
        var b = AddFolder(OrgId, "B");

        var result = await CreateSut().ValidateFolderMoveAsync(a, b.Id);

        Assert.True(result.IsOk);
    }

    [Fact]
    public async Task FolderMove_IntoForeignOrgFolder_IsInvalid()
    {
        var mine = AddFolder(OrgId, "Mine");
        var theirs = AddFolder(OtherOrgId, "Theirs");

        var result = await CreateSut().ValidateFolderMoveAsync(mine, theirs.Id);

        Assert.Equal(ServiceStatus.Invalid, result.Status);
    }

    [Fact]
    public async Task FolderMove_WithoutEditRightsOnDestination_IsForbidden()
    {
        var a = AddFolder(OrgId, "A");
        var b = AddFolder(OrgId, "B");
        _permissions.CanEdit = false;

        var result = await CreateSut().ValidateFolderMoveAsync(a, b.Id);

        Assert.Equal(ServiceStatus.Forbidden, result.Status);
    }

    [Fact]
    public async Task FileMove_ToRootOrOwnFolder_IsOk()
    {
        var file = new DriveFile(OrgId, OwnerId, "a.pdf", null, "blob", 1, "hash");
        var folder = AddFolder(OrgId, "Docs");

        Assert.True((await CreateSut().ValidateFileMoveAsync(file, null)).IsOk);
        Assert.True((await CreateSut().ValidateFileMoveAsync(file, folder.Id)).IsOk);
    }

    [Fact]
    public async Task FileMove_MissingOrForeignDestination_IsInvalid()
    {
        var file = new DriveFile(OrgId, OwnerId, "a.pdf", null, "blob", 1, "hash");
        var foreign = AddFolder(OtherOrgId, "Theirs");

        var missing = await CreateSut().ValidateFileMoveAsync(file, Guid.NewGuid());
        var cross = await CreateSut().ValidateFileMoveAsync(file, foreign.Id);

        Assert.Equal(ServiceStatus.Invalid, missing.Status);
        Assert.Equal(ServiceStatus.Invalid, cross.Status);
    }

    private sealed class FakePermissionService : IPermissionService
    {
        public bool CanEdit { get; set; } = true;

        public Task<bool> CanEditAsync(ShareResourceType t, Guid id, Guid orgId) =>
            Task.FromResult(CanEdit);

        public Task<bool> CanShareAsync(ShareResourceType t, Guid id, Guid orgId) =>
            Task.FromResult(false);
    }

    private sealed class FakeOrganizationProvider : ICurrentOrganizationProvider
    {
        public Guid OrganizationId => OrgId;
    }

    private sealed class FakeFolderRepository : IFolderRepository
    {
        public Dictionary<Guid, Folder> Items { get; } = [];

        public Task<Folder?> GetByIdAsync(Guid id) => Task.FromResult(Items.GetValueOrDefault(id));

        public Task<bool> IsSelfOrDescendantAsync(Guid folderId, Guid candidateId)
        {
            var visited = new HashSet<Guid>();
            Guid? current = candidateId;
            while (current is { } id && visited.Add(id))
            {
                if (id == folderId)
                    return Task.FromResult(true);
                current = Items.GetValueOrDefault(id)?.ParentFolderId;
            }
            return Task.FromResult(false);
        }

        public Task<IReadOnlyList<Folder>> GetByParentIdAsync(Guid? parentFolderId) =>
            throw new NotSupportedException();

        public Task AddAsync(Folder folder) => throw new NotSupportedException();

        public Task SaveChangesAsync() => throw new NotSupportedException();

        public Task<IReadOnlyList<Folder>> GetDeletedAsync() => throw new NotSupportedException();

        public Task<Folder?> GetDeletedByIdAsync(Guid id) => throw new NotSupportedException();

        public Task DeletePermanentAsync(Folder folder) => throw new NotSupportedException();

        public Task<IReadOnlyList<Folder>> GetDescendantsAsync(Guid rootId) =>
            throw new NotSupportedException();

        public void DeleteRange(IEnumerable<Folder> folders) => throw new NotSupportedException();

        public Task<IReadOnlyList<Folder>> GetStarredAsync() => throw new NotSupportedException();

        public Task<IReadOnlyList<Folder>> SearchAsync(string term) =>
            throw new NotSupportedException();
    }
}