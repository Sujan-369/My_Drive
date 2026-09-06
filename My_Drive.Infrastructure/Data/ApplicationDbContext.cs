using Microsoft.EntityFrameworkCore;
using My_Drive.Core.Entities;
using My_Drive.Core.Interfaces;

namespace My_Drive.Infrastructure.Data;

public sealed class ApplicationDbContext(
    DbContextOptions<ApplicationDbContext> options,
    ICurrentOrganizationProvider currentOrganizationProvider) : DbContext(options)
{
    public DbSet<Organization> Organizations => Set<Organization>();
    public DbSet<User> Users => Set<User>();
    public DbSet<Folder> Folders => Set<Folder>();
    public DbSet<DriveFile> DriveFiles => Set<DriveFile>();
    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.ApplyConfigurationsFromAssembly(typeof(ApplicationDbContext).Assembly);

        // The actual tenant isolation enforcement — every User query
        // is silently scoped to the current org, with no way to forget it.
        modelBuilder.Entity<User>().HasQueryFilter(u => u.OrganizationId == currentOrganizationProvider.OrganizationId);

        modelBuilder.Entity<Folder>().HasQueryFilter(f => f.OrganizationId == currentOrganizationProvider.OrganizationId);

        modelBuilder.Entity<DriveFile>().HasQueryFilter(f => f.OrganizationId == currentOrganizationProvider.OrganizationId);

        base.OnModelCreating(modelBuilder);
    }
}