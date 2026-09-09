using My_Drive.Core.Entities;
using Xunit;

namespace My_Drive.Core.Tests.Entities;

public class FolderTests
{
    private static readonly Guid OrgId = Guid.NewGuid();
    private static readonly Guid OwnerId = Guid.NewGuid();

    [Fact]
    public void Constructor_WithValidData_SetsProperties()
    {
        var folder = new Folder(OrgId, OwnerId, "Documents");

        Assert.Equal(OrgId, folder.OrganizationId);
        Assert.Equal(OwnerId, folder.OwnerId);
        Assert.Equal("Documents", folder.Name);
        Assert.Null(folder.ParentFolderId);
    }

    [Fact]
    public void Constructor_WithParentFolder_SetsParentFolderId()
    {
        var parentId = Guid.NewGuid();
        var folder = new Folder(OrgId, OwnerId, "Subfolder", parentId);

        Assert.Equal(parentId, folder.ParentFolderId);
    }

    [Theory]
    [InlineData("")]
    [InlineData("   ")]
    [InlineData(null)]
    public void Constructor_WithEmptyName_Throws(string? invalidName)
    {
        Assert.Throws<ArgumentException>(() => new Folder(OrgId, OwnerId, invalidName!));
    }

    [Fact]
    public void Constructor_WithEmptyOrganizationId_Throws()
    {
        Assert.Throws<ArgumentException>(() => new Folder(Guid.Empty, OwnerId, "Documents"));
    }

    [Fact]
    public void Rename_WithValidName_UpdatesName()
    {
        var folder = new Folder(OrgId, OwnerId, "Old Name");

        folder.Rename("New Name");

        Assert.Equal("New Name", folder.Name);
        Assert.True(folder.ModifiedAt >= folder.CreatedAt);
    }

    [Fact]
    public void Rename_WithEmptyName_Throws()
    {
        var folder = new Folder(OrgId, OwnerId, "Documents");
        Assert.Throws<ArgumentException>(() => folder.Rename(""));
    }

    [Fact]
    public void MoveTo_ToItself_Throws()
    {
        var folder = new Folder(OrgId, OwnerId, "Documents");
        Assert.Throws<InvalidOperationException>(() => folder.MoveTo(folder.Id));
    }

    [Fact]
    public void MoveTo_ToNewParent_UpdatesParentFolderId()
    {
        var folder = new Folder(OrgId, OwnerId, "Documents");
        var newParentId = Guid.NewGuid();

        folder.MoveTo(newParentId);

        Assert.Equal(newParentId, folder.ParentFolderId);
    }

    [Fact]
    public void Delete_SetsIsDeletedAndDeletedAt()
    {
        var folder = new Folder(OrgId, OwnerId, "Documents");

        folder.Delete();

        Assert.True(folder.IsDeleted);
        Assert.NotNull(folder.DeletedAt);
    }

    [Fact]
    public void Restore_ClearsIsDeletedAndDeletedAt()
    {
        var folder = new Folder(OrgId, OwnerId, "Documents");
        folder.Delete();

        folder.Restore();

        Assert.False(folder.IsDeleted);
        Assert.Null(folder.DeletedAt);
    }

    [Fact]
    public void Star_SetsIsStarredTrue()
    {
        var folder = new Folder(OrgId, OwnerId, "Documents");

        folder.Star();

        Assert.True(folder.IsStarred);
    }

    [Fact]
    public void Unstar_SetsIsStarredFalse()
    {
        var folder = new Folder(OrgId, OwnerId, "Documents");
        folder.Star();

        folder.Unstar();

        Assert.False(folder.IsStarred);
    }
}