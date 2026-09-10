using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using My_Drive.Core.Entities;

namespace My_Drive.Infrastructure.Data.Configurations;

public sealed class ActivityLogConfiguration : IEntityTypeConfiguration<ActivityLog>
{
    public void Configure(EntityTypeBuilder<ActivityLog> builder)
    {
        builder.HasKey(l => l.Id);
        builder.Property(l => l.ResourceName).IsRequired().HasMaxLength(255);
        builder.Property(l => l.Action).HasConversion<string>().HasMaxLength(20);
        builder.Property(l => l.ResourceType).HasConversion<string>().HasMaxLength(20);
        builder.HasIndex(l => new { l.OrganizationId, l.CreatedAt });
    }
}