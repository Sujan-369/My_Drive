using Google.Apis.Auth;
using Microsoft.Extensions.Configuration;
using My_Drive.Core.Interfaces;
using My_Drive.Core.Models;

namespace My_Drive.Infrastructure.Auth;

public sealed class GoogleTokenValidator(IConfiguration configuration) : IGoogleTokenValidator
{
    private readonly string _clientId = configuration["Google:ClientId"]
        ?? throw new InvalidOperationException("Google:ClientId is not configured.");

    public async Task<GoogleIdentity?> ValidateAsync(string idToken)
    {
        try
        {
            var settings = new GoogleJsonWebSignature.ValidationSettings
            {
                Audience = [_clientId]
            };
            var payload = await GoogleJsonWebSignature.ValidateAsync(idToken, settings);
            return new GoogleIdentity(payload.Subject, payload.Email, payload.Name);
        }
        catch (InvalidJwtException)
        {
            return null;
        }
    }
}