using My_Drive.Core.Interfaces;

namespace My_Drive.Auth;

public sealed class CurrentOrganizationProvider(IHttpContextAccessor httpContextAccessor) : ICurrentOrganizationProvider
{
    public Guid OrganizationId
    {
        get
        {
            var claim = httpContextAccessor.HttpContext?.User.FindFirst("org_id")?.Value;
            return claim is not null && Guid.TryParse(claim, out var id) ? id : Guid.Empty;
        }
    }
}