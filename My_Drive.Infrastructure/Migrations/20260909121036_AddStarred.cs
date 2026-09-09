using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace My_Drive.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddStarred : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<bool>(
                name: "IsStarred",
                table: "Folders",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<bool>(
                name: "IsStarred",
                table: "DriveFiles",
                type: "boolean",
                nullable: false,
                defaultValue: false);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "IsStarred",
                table: "Folders");

            migrationBuilder.DropColumn(
                name: "IsStarred",
                table: "DriveFiles");
        }
    }
}
