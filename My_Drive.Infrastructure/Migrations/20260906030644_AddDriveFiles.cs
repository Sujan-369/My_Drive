using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace My_Drive.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddDriveFiles : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "DriveFiles",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    OrganizationId = table.Column<Guid>(type: "uuid", nullable: false),
                    FolderId = table.Column<Guid>(type: "uuid", nullable: true),
                    OwnerId = table.Column<Guid>(type: "uuid", nullable: false),
                    Name = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    ContentHash = table.Column<string>(type: "text", nullable: false),
                    Size = table.Column<long>(type: "bigint", nullable: false),
                    CurrentVersionId = table.Column<Guid>(type: "uuid", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    ModifiedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_DriveFiles", x => x.Id);
                    table.ForeignKey(
                        name: "FK_DriveFiles_Folders_FolderId",
                        column: x => x.FolderId,
                        principalTable: "Folders",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_DriveFiles_Organizations_OrganizationId",
                        column: x => x.OrganizationId,
                        principalTable: "Organizations",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "FileVersion",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    FileId = table.Column<Guid>(type: "uuid", nullable: false),
                    BlobPath = table.Column<string>(type: "text", nullable: false),
                    Size = table.Column<long>(type: "bigint", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_FileVersion", x => x.Id);
                    table.ForeignKey(
                        name: "FK_FileVersion_DriveFiles_FileId",
                        column: x => x.FileId,
                        principalTable: "DriveFiles",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_DriveFiles_ContentHash",
                table: "DriveFiles",
                column: "ContentHash");

            migrationBuilder.CreateIndex(
                name: "IX_DriveFiles_FolderId",
                table: "DriveFiles",
                column: "FolderId");

            migrationBuilder.CreateIndex(
                name: "IX_DriveFiles_OrganizationId_FolderId",
                table: "DriveFiles",
                columns: new[] { "OrganizationId", "FolderId" });

            migrationBuilder.CreateIndex(
                name: "IX_FileVersion_FileId",
                table: "FileVersion",
                column: "FileId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "FileVersion");

            migrationBuilder.DropTable(
                name: "DriveFiles");
        }
    }
}
