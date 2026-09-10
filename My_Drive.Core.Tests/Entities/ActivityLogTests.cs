using My_Drive.Core.Entities;
using Xunit;

namespace My_Drive.Core.Tests.Entities;

public class ActivityLogTests
{
    private static readonly Guid OrgId = Guid.NewGuid();
    private static readonly Guid ActorId = Guid.NewGuid();
    private static readonly Guid ResourceId = Guid.NewGuid();

    [Fact]
    public void Constructor_WithValidData_SetsProperties()
    {
        var log = new ActivityLog(OrgId, ActorId, ActivityAction.Uploaded, ActivityResourceType.File, ResourceId, "report.pdf");

        Assert.Equal(OrgId, log.OrganizationId);
        Assert.Equal(ActorId, log.ActorId);
        Assert.Equal(ActivityAction.Uploaded, log.Action);
        Assert.Equal(ActivityResourceType.File, log.ResourceType);
        Assert.Equal(ResourceId, log.ResourceId);
        Assert.Equal("report.pdf", log.ResourceName);
    }

    [Fact]
    public void Constructor_WithEmptyOrganizationId_Throws()
    {
        Assert.Throws<ArgumentException>(() =>
            new ActivityLog(Guid.Empty, ActorId, ActivityAction.Uploaded, ActivityResourceType.File, ResourceId, "report.pdf"));
    }

    [Fact]
    public void Constructor_WithEmptyResourceName_Throws()
    {
        Assert.Throws<ArgumentException>(() =>
            new ActivityLog(OrgId, ActorId, ActivityAction.Uploaded, ActivityResourceType.File, ResourceId, ""));
    }
}