using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Petsociety.Migrations
{
    /// <inheritdoc />
    public partial class CleanupLostFoundReport : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Phone",
                table: "LostFoundReports");

            migrationBuilder.DropColumn(
                name: "ReunitedAt",
                table: "LostFoundReports");

            migrationBuilder.DropColumn(
                name: "Species",
                table: "LostFoundReports");

            migrationBuilder.DropColumn(
                name: "Title",
                table: "LostFoundReports");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "Phone",
                table: "LostFoundReports",
                type: "nvarchar(20)",
                maxLength: 20,
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "ReunitedAt",
                table: "LostFoundReports",
                type: "datetime2",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Species",
                table: "LostFoundReports",
                type: "nvarchar(50)",
                maxLength: 50,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Title",
                table: "LostFoundReports",
                type: "nvarchar(20)",
                maxLength: 20,
                nullable: true);
        }
    }
}
