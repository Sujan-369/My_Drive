using My_Drive.Core.Entities;

namespace My_Drive.Core.Interfaces;

public interface ITokenService
{
    string GenerateToken(User user);
}