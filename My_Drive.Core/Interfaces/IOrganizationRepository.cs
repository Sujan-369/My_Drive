using My_Drive.Core.Entities;

namespace My_Drive.Core.Interfaces;

public interface IOrganizationRepository
{
    Task AddAsync(Organization organization);
}