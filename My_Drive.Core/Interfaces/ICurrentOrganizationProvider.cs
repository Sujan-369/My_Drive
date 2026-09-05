namespace My_Drive.Core.Interfaces;

public interface ICurrentOrganizationProvider
{
    Guid OrganizationId { get; }
}