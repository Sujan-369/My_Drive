namespace My_Drive.Core.Interfaces;

public interface ICurrentUserProvider
{
    Guid UserId { get; }
}