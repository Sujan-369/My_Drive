using System.Net;
using System.Text.Json;

namespace My_Drive.Middleware;

public sealed class ExceptionHandlingMiddleware(
    RequestDelegate next,
    ILogger<ExceptionHandlingMiddleware> logger
)
{
    public async Task InvokeAsync(HttpContext context)
    {
        try
        {
            await next(context);
        }
        catch (Exception ex) when (ex is ArgumentException or InvalidOperationException)
        {
            // Deliberate validation failures raised by our own entities
            // (Folder.Rename, DriveFile.Rename, Share's self-share guard,
            // etc.) — the client sent something invalid, not a server bug.
            context.Response.StatusCode = (int)HttpStatusCode.BadRequest;
            context.Response.ContentType = "application/json";
            await context.Response.WriteAsync(
                JsonSerializer.Serialize(new { message = ex.Message })
            );
        }
        catch (Exception ex)
        {
            // Anything else is unexpected. Log the real details server-side,
            // but never leak internals (stack traces, types) to the client.
            logger.LogError(
                ex,
                "Unhandled exception processing {Method} {Path}",
                context.Request.Method,
                context.Request.Path
            );
            context.Response.StatusCode = (int)HttpStatusCode.InternalServerError;
            context.Response.ContentType = "application/json";
            await context.Response.WriteAsync(
                JsonSerializer.Serialize(
                    new { message = "Something went wrong. Please try again." }
                )
            );
        }
    }
}
