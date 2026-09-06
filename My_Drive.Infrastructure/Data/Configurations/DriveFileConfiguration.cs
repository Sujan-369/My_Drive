using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using My_Drive.Core.Entities;

namespace My_Drive.Infrastructure.Data.Configurations;

public sealed class DriveFileConfiguration : IEntityTypeConfiguration<DriveFile>
{
    public void Configure(EntityTypeBuilder<DriveFile> builder)
    {
        builder.HasKey(f => f.Id);
        builder.Property(f => f.Name).IsRequired().HasMaxLength(255);
        builder.Property(f => f.ContentHash).IsRequired();
        builder.HasIndex(f => new { f.OrganizationId, f.FolderId });
        builder.HasIndex(f => f.ContentHash); // groundwork for the dedup feature, Sprint 5

        // The Versions collection is a genuinely owned, private detail of
        // DriveFile — nothing outside it ever queries FileVersion directly.
        builder.OwnsMany(f => f.Versions, versions =>
        {
            versions.WithOwner().HasForeignKey(v => v.FileId);
            versions.HasKey(v => v.Id);
            versions.Property(v => v.BlobPath).IsRequired();
        });
        builder.Navigation(f => f.Versions).UsePropertyAccessMode(PropertyAccessMode.Field);

        builder.HasOne<Organization>()
            .WithMany()
            .HasForeignKey(f => f.OrganizationId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasOne<Folder>()
            .WithMany()
            .HasForeignKey(f => f.FolderId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}