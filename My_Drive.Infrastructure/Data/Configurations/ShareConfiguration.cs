using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using My_Drive.Core.Entities;

namespace My_Drive.Infrastructure.Data.Configurations;

public sealed class ShareConfiguration : IEntityTypeConfiguration<Share>
{
    public void Configure(EntityTypeBuilder<Share> builder)
    {
        builder.HasKey(s => s.Id);
        builder.Property(s => s.ResourceType).HasConversion<string>().HasMaxLength(20);
        builder.Property(s => s.Permission).HasConversion<string>().HasMaxLength(20);

        // One share per (resource, recipient) — sharing the same file with
        // the same person twice should update the existing grant, not duplicate it.
        builder
            .HasIndex(s => new
            {
                s.ResourceType,
                s.ResourceId,
                s.SharedWithUserId,
            })
            .IsUnique();
        builder.HasIndex(s => s.SharedWithUserId);
    }
}
