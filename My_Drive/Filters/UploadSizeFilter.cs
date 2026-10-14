using Microsoft.AspNetCore.Http.Features;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;
using My_Drive.Core.Models;

namespace My_Drive.Filters;

public sealed class UploadSizeFilter(UploadPolicyOptions policy) : IAsyncResourceFilter
{
    // Multipart framing (boundaries, headers, the FolderId field) on top of the file bytes.
    public const long OverheadBytes = 1_048_576;

    public async Task OnResourceExecutionAsync(
        ResourceExecutingContext context,
        ResourceExecutionDelegate next
    )
    {
        var limit = policy.MaxFileBytes + OverheadBytes;

        if (context.HttpContext.Request.ContentLength > limit)
        {
            context.Result = new ObjectResult(
                new
                {
                    message = $"That upload is too large. The maximum file size is {ByteFormat.Format(policy.MaxFileBytes)}.",
                }
            )
            {
                StatusCode = StatusCodes.Status413PayloadTooLarge,
            };
            return;
        }

        // Backstop for requests without a Content-Length (e.g. chunked uploads).
        var feature = context.HttpContext.Features.Get<IHttpMaxRequestBodySizeFeature>();
        if (feature is { IsReadOnly: false })
            feature.MaxRequestBodySize = limit;

        await next();
    }
}