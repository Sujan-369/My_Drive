using My_Drive.Core.Interfaces;
using My_Drive.Core.Models;

namespace My_Drive.Core.Services;

public sealed class UploadPolicy(UploadPolicyOptions options) : IUploadPolicy
{
    public UploadPolicyOptions Options => options;

    public ServiceResult Validate(string fileName, long sizeBytes)
    {
        if (sizeBytes > options.MaxFileBytes)
        {
            return ServiceResult.TooLarge(
                $"\"{fileName}\" is {ByteFormat.Format(sizeBytes)}, which is over the "
                    + $"{ByteFormat.Format(options.MaxFileBytes)} per-file limit."
            );
        }

        var extension = Path.GetExtension(fileName).ToLowerInvariant();
        if (extension.Length > 0 && options.BlockedExtensions.Contains(extension))
        {
            return ServiceResult.UnsupportedType(
                $"\"{fileName}\" can't be uploaded — {extension} files aren't allowed."
            );
        }

        return ServiceResult.Ok();
    }
}