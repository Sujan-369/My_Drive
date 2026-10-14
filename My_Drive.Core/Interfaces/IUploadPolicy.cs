using My_Drive.Core.Models;

namespace My_Drive.Core.Interfaces;

public interface IUploadPolicy
{
    UploadPolicyOptions Options { get; }

    ServiceResult Validate(string fileName, long sizeBytes);
}