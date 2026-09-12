using My_Drive.Core.Entities;
using My_Drive.Core.Models;

namespace My_Drive.Core.Interfaces;

public interface IShareRepository
{
    Task AddAsync(Share share);
    Task<IReadOnlyList<SharedResourceInfo>> GetSharedWithMeAsync(Guid userId);
    Task<HashSet<Guid>> GetSharedResourceIdsAsync(
        Guid sharedByUserId,
        ShareResourceType resourceType
    );
}
