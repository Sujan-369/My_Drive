using System.Text;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc.Authorization;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.AspNetCore.Http.Features;
using Microsoft.AspNetCore.Mvc;
using My_Drive.Core.Models;
using My_Drive.Filters;
using My_Drive.Auth;
using My_Drive.Core.Interfaces;
using My_Drive.Core.Services;
using My_Drive.Infrastructure.Auth;
using My_Drive.Infrastructure.BackgroundJobs;
using My_Drive.Infrastructure.Data;
using My_Drive.Infrastructure.Repositories;
using My_Drive.Infrastructure.Services;
using My_Drive.Infrastructure.Storage;
using My_Drive.Middleware;
using Scalar.AspNetCore;

namespace My_Drive
{
    public class Program
    {
        public static void Main(string[] args)
        {
            var builder = WebApplication.CreateBuilder(args);

            // Add services to the container.

            builder
                .Services.AddControllers(options =>
                {
                    var policy = new AuthorizationPolicyBuilder().RequireAuthenticatedUser().Build();
                    options.Filters.Add(new AuthorizeFilter(policy));
                })
                .ConfigureApiBehaviorOptions(options =>
                {
                    // One error shape for every API failure: { message }. Binding errors would
                    // otherwise come back as ProblemDetails, which the client can't display.
                    options.InvalidModelStateResponseFactory = context =>
                    {
                        var message = context
                            .ModelState.Values.SelectMany(v => v.Errors)
                            .Select(e => e.ErrorMessage)
                            .FirstOrDefault(m => !string.IsNullOrWhiteSpace(m));
                        return new BadRequestObjectResult(
                            new { message = message ?? "The request was invalid." }
                        );
                    };
                });

            // Learn more about configuring OpenAPI at https://aka.ms/aspnet/openapi
            builder.Services.AddOpenApi();

            var allowedOrigins =
                builder.Configuration.GetSection("Cors:AllowedOrigins").Get<string[]>()
                ?? ["http://localhost:5173", "http://localhost:5174"];

            builder.Services.AddCors(options =>
            {
                options.AddPolicy(
                    "AllowReactClient",
                    policy =>
                    {
                        policy.WithOrigins(allowedOrigins).AllowAnyHeader().AllowAnyMethod();
                    }
                );
            });

            builder
                .Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
                .AddJwtBearer(options =>
                {
                    options.MapInboundClaims = false;
                    options.TokenValidationParameters = new TokenValidationParameters
                    {
                        ValidateIssuer = true,
                        ValidIssuer = builder.Configuration["Jwt:Issuer"],
                        ValidateAudience = true,
                        ValidAudience = builder.Configuration["Jwt:Audience"],
                        ValidateLifetime = true,
                        ValidateIssuerSigningKey = true,
                        IssuerSigningKey = new SymmetricSecurityKey(
                            Encoding.UTF8.GetBytes(builder.Configuration["Jwt:Key"]!)
                        ),
                    };
                });

            builder.Services.AddAuthorization();
            builder.Services.AddScoped<ITokenService, JwtTokenService>();

            builder.Services.AddHttpContextAccessor();
            builder.Services.AddDbContext<ApplicationDbContext>(options =>
                options.UseNpgsql(builder.Configuration.GetConnectionString("DefaultConnection"))
            );
            builder.Services.AddScoped<ICurrentOrganizationProvider, CurrentOrganizationProvider>();

            builder.Services.AddScoped<IGoogleTokenValidator, GoogleTokenValidator>();
            builder.Services.AddScoped<IUserRepository, UserRepository>();
            builder.Services.AddScoped<IOrganizationRepository, OrganizationRepository>();
            builder.Services.AddScoped<IAuthService, AuthService>();

            builder.Services.AddScoped<IFolderRepository, FolderRepository>();
            builder.Services.AddScoped<ICurrentUserProvider, CurrentUserProvider>();

            builder.Services.AddScoped<IActivityLogRepository, ActivityLogRepository>();
            builder.Services.AddScoped<IActivityLogger, ActivityLogger>();

            builder.Services.AddScoped<IShareRepository, ShareRepository>();

            builder.Services.AddScoped<IFileRepository, FileRepository>();

            builder.Services.AddScoped<IPermissionService, PermissionService>();

            builder.Services.AddScoped<IFolderService, FolderService>();

            builder.Services.AddScoped<IShareService, ShareService>();

            builder.Services.AddSingleton(
                new StorageQuotaOptions(
                    builder.Configuration.GetValue("Storage:OrgQuotaBytes", 1_073_741_824L)
                )
            );

            builder.Services.AddScoped<IStorageQuotaService, StorageQuotaService>();

            var uploadOptions = new UploadPolicyOptions(
    builder.Configuration.GetValue("Upload:MaxFileBytes", 104_857_600L),
    (
        builder.Configuration.GetSection("Upload:BlockedExtensions").Get<string[]>()
        ?? [".exe", ".msi", ".bat", ".cmd", ".com", ".scr", ".dll", ".vbs", ".ps1", ".jar"]
    )
        .Select(e => e.Trim().ToLowerInvariant())
        .Select(e => e.StartsWith('.') ? e : "." + e)
        .ToHashSet()
);
            builder.Services.AddSingleton(uploadOptions);
            builder.Services.AddSingleton<IUploadPolicy, UploadPolicy>();
            builder.Services.AddScoped<UploadSizeFilter>();
            builder.Services.Configure<FormOptions>(options =>
                options.MultipartBodyLengthLimit =
                    uploadOptions.MaxFileBytes + UploadSizeFilter.OverheadBytes
            );

            builder.Services.AddSingleton<IBlobStorageService, AzureBlobStorageService>();

            builder.Services.AddHostedService<TrashPurgeService>();

            var app = builder.Build();

            // Apply pending EF migrations before serving traffic. Fail fast: if this
            // throws, the container exits and Container Apps surfaces it in the logs
            // instead of running against a stale schema. EF 9+ takes a DB-level lock
            // while migrating, so a second replica starting at the same time is safe.
            if (app.Configuration.GetValue("Database:MigrateOnStartup", true))
            {
                using var scope = app.Services.CreateScope();
                var db = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
                db.Database.Migrate();
            }

            app.UseMiddleware<ExceptionHandlingMiddleware>();

            app.UseRouting();

            app.UseCors("AllowReactClient");

            // Configure the HTTP request pipeline.
            if (app.Environment.IsDevelopment())
            {
                app.MapOpenApi();
                app.MapScalarApiReference();
            }

            app.UseHttpsRedirection();

            app.UseAuthorization();

            app.MapControllers();

            app.Run();
        }
    }
}
