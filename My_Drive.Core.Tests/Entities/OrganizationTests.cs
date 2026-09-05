using My_Drive.Core.Entities;
using Xunit;

namespace My_Drive.Core.Tests.Entities;

public class OrganizationTests
{
    [Fact]
    public void Constructor_WithValidName_SetsProperties()
    {
        var org = new Organization("Acme Inc");

        Assert.NotEqual(Guid.Empty, org.Id);
        Assert.Equal("Acme Inc", org.Name);
    }

    [Theory]
    [InlineData("")]
    [InlineData("   ")]
    [InlineData(null)]
    public void Constructor_WithEmptyName_Throws(string? invalidName)
    {
        Assert.Throws<ArgumentException>(() => new Organization(invalidName!));
    }
}