using My_Drive.Core.Entities;
using Xunit;

namespace My_Drive.Core.Tests.Entities;

public class DriveFileTests
{
    private static readonly Guid OrgId = Guid.NewGuid();
    private static readonly Guid OwnerId = Guid.NewGuid();

    [Fact]
    public void Constructor_WithValidData_CreatesFileWithInitialVersion()
    {
        var file = new DriveFile(OrgId, OwnerId, "report.pdf", null, "blobs/abc123", 1024, "hash1");

        Assert.Equal("report.pdf", file.Name);
        Assert.Equal(1024, file.Size);
        Assert.Equal("hash1", file.ContentHash);
        Assert.Single(file.Versions);
        Assert.Equal(file.CurrentVersionId, file.Versions[0].Id);
    }

    [Fact]
    public void Constructor_WithoutFolderId_AllowsRootLevelFile()
    {
        var file = new DriveFile(OrgId, OwnerId, "report.pdf", null, "blobs/abc123", 1024, "hash1");
        Assert.Null(file.FolderId);
    }

    [Fact]
    public void Constructor_WithFolderId_SetsFolderId()
    {
        var folderId = Guid.NewGuid();
        var file = new DriveFile(OrgId, OwnerId, "report.pdf", folderId, "blobs/abc123", 1024, "hash1");
        Assert.Equal(folderId, file.FolderId);
    }

    [Theory]
    [InlineData("")]
    [InlineData("   ")]
    [InlineData(null)]
    public void Constructor_WithEmptyName_Throws(string? invalidName)
    {
        Assert.Throws<ArgumentException>(() =>
            new DriveFile(OrgId, OwnerId, invalidName!, null, "blobs/abc123", 1024, "hash1"));
    }

    [Fact]
    public void Constructor_WithNegativeSize_Throws()
    {
        Assert.Throws<ArgumentException>(() =>
            new DriveFile(OrgId, OwnerId, "report.pdf", null, "blobs/abc123", -1, "hash1"));
    }

    [Fact]
    public void AddVersion_UpdatesCurrentVersionSizeAndHash()
    {
        var file = new DriveFile(OrgId, OwnerId, "report.pdf", null, "blobs/v1", 1024, "hash1");
        var firstVersionId = file.CurrentVersionId;

        file.AddVersion("blobs/v2", 2048, "hash2");

        Assert.Equal(2, file.Versions.Count);
        Assert.NotEqual(firstVersionId, file.CurrentVersionId);
        Assert.Equal(2048, file.Size);
        Assert.Equal("hash2", file.ContentHash);
    }

    [Fact]
    public void Rename_WithValidName_UpdatesName()
    {
        var file = new DriveFile(OrgId, OwnerId, "old.pdf", null, "blobs/v1", 1024, "hash1");
        file.Rename("new.pdf");
        Assert.Equal("new.pdf", file.Name);
    }

    [Fact]
    public void MoveTo_UpdatesFolderId()
    {
        var file = new DriveFile(OrgId, OwnerId, "report.pdf", null, "blobs/v1", 1024, "hash1");
        var newFolderId = Guid.NewGuid();

        file.MoveTo(newFolderId);

        Assert.Equal(newFolderId, file.FolderId);
    }
}