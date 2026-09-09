using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace My_Drive.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddSoftDelete : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<DateTime>(
                name: "DeletedAt",
                table: "Folders",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "IsDeleted",
                table: "Folders",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<DateTime>(
                name: "DeletedAt",
                table: "DriveFiles",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "IsDeleted",
                table: "DriveFiles",
                type: "boolean",
                nullable: false,
                defaultValue: false);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "DeletedAt",
                table: "Folders");

            migrationBuilder.DropColumn(
                name: "IsDeleted",
                table: "Folders");

            migrationBuilder.DropColumn(
                name: "DeletedAt",
                table: "DriveFiles");

            migrationBuilder.DropColumn(
                name: "IsDeleted",
                table: "DriveFiles");
        }
    }
}
