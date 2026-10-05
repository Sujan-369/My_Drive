using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace My_Drive.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddLastRecentClearedAt : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<DateTime>(
                name: "LastRecentClearedAt",
                table: "Users",
                type: "timestamp with time zone",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "LastRecentClearedAt",
                table: "Users");
        }
    }
}
