using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using My_Drive.Core.Entities;

namespace My_Drive.Infrastructure.Data.Configurations;

public sealed class FolderConfiguration : IEntityTypeConfiguration<Folder>
{
    public void Configure(EntityTypeBuilder<Folder> builder)
    {
        builder.HasKey(f => f.Id);
        builder.Property(f => f.Name).IsRequired().HasMaxLength(255);
        builder.HasIndex(f => new { f.OrganizationId, f.ParentFolderId });

        builder.HasOne<Organization>()
            .WithMany()
            .HasForeignKey(f => f.OrganizationId)
            .OnDelete(DeleteBehavior.Cascade);

        // Self-referencing parent relationship. Restrict, not cascade —
        // deleting a folder shouldn't silently cascade-delete everything
        // inside it via the FK. Trash/recursive-delete is real application
        // logic for a later sprint, not an accidental schema side effect.
        builder.HasOne<Folder>()
            .WithMany()
            .HasForeignKey(f => f.ParentFolderId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}