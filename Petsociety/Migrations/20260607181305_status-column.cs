using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Petsociety.Migrations
{
    /// <inheritdoc />
    public partial class statuscolumn : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "AdminNote",
                table: "LostFoundReports");

            migrationBuilder.DropColumn(
                name: "FinderUserId",
                table: "LostFoundReports");

            migrationBuilder.DropColumn(
                name: "IsDisputed",
                table: "LostFoundReports");

            migrationBuilder.DropColumn(
                name: "OwnerUserId",
                table: "LostFoundReports");

            migrationBuilder.DropColumn(
                name: "ResolvedAt",
                table: "LostFoundReports");

            migrationBuilder.AddColumn<string>(
                name: "Status",
                table: "Pets",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Status",
                table: "Pets");

            migrationBuilder.AddColumn<string>(
                name: "AdminNote",
                table: "LostFoundReports",
                type: "nvarchar(500)",
                maxLength: 500,
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "FinderUserId",
                table: "LostFoundReports",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "IsDisputed",
                table: "LostFoundReports",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<int>(
                name: "OwnerUserId",
                table: "LostFoundReports",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "ResolvedAt",
                table: "LostFoundReports",
                type: "datetime2",
                nullable: true);
        }
    }
}
