using My_Drive.Core.Entities;

namespace My_Drive.Core.Interfaces;

public interface IShareRepository
{
    Task AddAsync(Share share);
}
