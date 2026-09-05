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
            new User(Guid.Empty, "test@example.com", "Test User", "google-sub-123"));
    }
}