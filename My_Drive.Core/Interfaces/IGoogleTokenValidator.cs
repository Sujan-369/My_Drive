using My_Drive.Core.Models;

namespace My_Drive.Core.Interfaces;

public interface IGoogleTokenValidator
{
    Task<GoogleIdentity?> ValidateAsync(string idToken);
}