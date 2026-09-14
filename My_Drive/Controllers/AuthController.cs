using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using My_Drive.Contracts.Auth;
using My_Drive.Core.Interfaces;

namespace My_Drive.Controllers;

[ApiController]
[Route("api/auth")]
[Authorize]
public sealed class AuthController(
    IAuthService authService,
    ITokenService tokenService,
    ICurrentUserProvider currentUserProvider,
    IUserRepository userRepository
) : ControllerBase
{
    [AllowAnonymous]
    [HttpPost("google")]
    public async Task<ActionResult<AuthResponse>> SignInWithGoogle(
        [FromBody] GoogleSignInRequest request
    )
    {
        var user = await authService.SignInWithGoogleAsync(request.IdToken);
        var token = tokenService.GenerateToken(user);
        return Ok(
            new AuthResponse(
                token,
                user.Id,
                user.OrganizationId,
                user.Email,
                user.DisplayName,
                user.PictureUrl
            )
        );
    }

    [HttpGet("me")]
    public async Task<ActionResult<CurrentUserResponse>> Me()
    {
        var user = await userRepository.GetByIdAsync(currentUserProvider.UserId);
        if (user is null)
            return NotFound();

        return Ok(
            new CurrentUserResponse(
                user.Id,
                user.OrganizationId,
                user.Email,
                user.DisplayName,
                user.PictureUrl
            )
        );
    }
}
