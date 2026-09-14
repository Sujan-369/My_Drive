using My_Drive.Core.Entities;
using Xunit;

namespace My_Drive.Core.Tests.Entities;

public class UserTests
{
    [Fact]
    public void Constructor_WithValidData_SetsProperties()
    {
        var orgId = Guid.NewGuid();
        var user = new User(orgId, "test@example.com", "Test User", "google-sub-123");

        Assert.Equal(orgId, user.OrganizationId);
        Assert.Equal("test@example.com", user.Email);
    }

    [Fact]
    public void Constructor_WithEmptyOrganizationId_Throws()
    {
        Assert.Throws<ArgumentException>(() =>
            new User(Guid.Empty, "test@example.com", "Test User", "google-sub-123")
        );
    }

    [Fact]
    public void Constructor_WithPictureUrl_SetsPictureUrl()
    {
        var user = new User(
            Guid.NewGuid(),
            "test@example.com",
            "Test User",
            "sub-123",
            "https://example.com/pic.jpg"
        );
        Assert.Equal("https://example.com/pic.jpg", user.PictureUrl);
    }

    [Fact]
    public void UpdateProfile_UpdatesDisplayNameAndPictureUrl()
    {
        var user = new User(Guid.NewGuid(), "test@example.com", "Old Name", "sub-123");
        user.UpdateProfile("New Name", "https://example.com/new.jpg");
        Assert.Equal("New Name", user.DisplayName);
        Assert.Equal("https://example.com/new.jpg", user.PictureUrl);
    }
}
