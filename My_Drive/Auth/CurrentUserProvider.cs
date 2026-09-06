using System.IdentityModel.Tokens.Jwt;
using My_Drive.Core.Interfaces;

namespace My_Drive.Auth;

public sealed class CurrentUserProvider(IHttpContextAccessor httpContextAccessor) : ICurrentUserProvider
{
    public Guid UserId
    {
        get
        {
            var claim = httpContextAccessor.HttpContext?.User.FindFirst(JwtRegisteredClaimNames.Sub)?.Value;
            return claim is not null && Guid.TryParse(claim, out var id) ? id : Guid.Empty;
        }
    }
}