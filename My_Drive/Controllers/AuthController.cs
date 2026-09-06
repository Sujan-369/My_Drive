using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using My_Drive.Contracts.Auth;
using My_Drive.Core.Interfaces;

namespace My_Drive.Controllers;

[ApiController]
[Route("api/auth")]
[AllowAnonymous]
public sealed class AuthController(IAuthService authService, ITokenService tokenService) : ControllerBase
{
    [HttpPost("google")]
    public async Task<ActionResult<AuthResponse>> SignInWithGoogle([FromBody] GoogleSignInRequest request)
    {
        var user = await authService.SignInWithGoogleAsync(request.IdToken);
        var token = tokenService.GenerateToken(user);
        return Ok(new AuthResponse(token, user.Id, user.OrganizationId, user.Email, user.DisplayName));
    }
}