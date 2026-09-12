using My_Drive.Core.Entities;
using Xunit;

namespace My_Drive.Core.Tests.Entities;

public class ShareTests
{
    private static readonly Guid ResourceId = Guid.NewGuid();
    private static readonly Guid SharedById = Guid.NewGuid();
    private static readonly Guid SharedWithId = Guid.NewGuid();

    [Fact]
    public void Constructor_WithValidData_SetsProperties()
    {
        var share = new Share(
            ShareResourceType.File,
            ResourceId,
            SharedById,
            SharedWithId,
            SharePermission.Viewer
        );

        Assert.Equal(ResourceId, share.ResourceId);
        Assert.Equal(SharedById, share.SharedByUserId);
        Assert.Equal(SharedWithId, share.SharedWithUserId);
        Assert.Equal(SharePermission.Viewer, share.Permission);
    }

    [Fact]
    public void Constructor_SharingWithSelf_Throws()
    {
        Assert.Throws<InvalidOperationException>(() =>
            new Share(
                ShareResourceType.File,
                ResourceId,
                SharedById,
                SharedById,
                SharePermission.Viewer
            )
        );
    }

    [Fact]
    public void Constructor_WithEmptyResourceId_Throws()
    {
        Assert.Throws<ArgumentException>(() =>
            new Share(
                ShareResourceType.File,
                Guid.Empty,
                SharedById,
                SharedWithId,
                SharePermission.Viewer
            )
        );
    }

    [Fact]
    public void IsExpired_WithPastExpiryDate_ReturnsTrue()
    {
        var share = new Share(
            ShareResourceType.File,
            ResourceId,
            SharedById,
            SharedWithId,
            SharePermission.Viewer,
            DateTime.UtcNow.AddDays(-1)
        );
        Assert.True(share.IsExpired);
    }

    [Fact]
    public void IsExpired_WithNoExpiryDate_ReturnsFalse()
    {
        var share = new Share(
            ShareResourceType.File,
            ResourceId,
            SharedById,
            SharedWithId,
            SharePermission.Viewer
        );
        Assert.False(share.IsExpired);
    }
}
