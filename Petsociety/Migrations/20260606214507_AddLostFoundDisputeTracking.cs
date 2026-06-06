using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Petsociety.Migrations
{
    /// <inheritdoc />
    public partial class AddLostFoundDisputeTracking : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<DateTime>(
                name: "DeletedAt",
                table: "Users",
                type: "datetime2",
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "IsActive",
                table: "Users",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<bool>(
                name: "IsDeleted",
                table: "Users",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<bool>(
                name: "IsRestricted",
                table: "Users",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AlterColumn<int>(
                name: "Type",
                table: "LostFoundReports",
                type: "int",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "nvarchar(max)");

            migrationBuilder.AlterColumn<string>(
                name: "Title",
                table: "LostFoundReports",
                type: "nvarchar(20)",
                maxLength: 20,
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(max)");

            migrationBuilder.AlterColumn<string>(
                name: "Species",
                table: "LostFoundReports",
                type: "nvarchar(50)",
                maxLength: 50,
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(max)");

            migrationBuilder.AlterColumn<string>(
                name: "Phone",
                table: "LostFoundReports",
                type: "nvarchar(20)",
                maxLength: 20,
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(max)");

            migrationBuilder.AlterColumn<string>(
                name: "DateText",
                table: "LostFoundReports",
                type: "nvarchar(30)",
                maxLength: 30,
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(max)");

            migrationBuilder.AddColumn<string>(
                name: "AdminNote",
                table: "LostFoundReports",
                type: "nvarchar(500)",
                maxLength: 500,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Breed",
                table: "LostFoundReports",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "ColorMarkings",
                table: "LostFoundReports",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<DateTime>(
                name: "DateLastSeen",
                table: "LostFoundReports",
                type: "datetime2",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified));

            migrationBuilder.AddColumn<int>(
                name: "FinderUserId",
                table: "LostFoundReports",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "ImageFileName",
                table: "LostFoundReports",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<bool>(
                name: "IsDisputed",
                table: "LostFoundReports",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<bool>(
                name: "IsPublished",
                table: "LostFoundReports",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<int>(
                name: "OwnerUserId",
                table: "LostFoundReports",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "PetType",
                table: "LostFoundReports",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "ReporterName",
                table: "LostFoundReports",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "ReporterPhone",
                table: "LostFoundReports",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<int>(
                name: "ReporterUserId",
                table: "LostFoundReports",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "ResolvedAt",
                table: "LostFoundReports",
                type: "datetime2",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "ReunitedAt",
                table: "LostFoundReports",
                type: "datetime2",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "Status",
                table: "LostFoundReports",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<DateTime>(
                name: "UpdatedAt",
                table: "LostFoundReports",
                type: "datetime2",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified));

            migrationBuilder.AddColumn<bool>(
                name: "IsAutoFlagged",
                table: "CommunityMessages",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<bool>(
                name: "IsReported",
                table: "CommunityMessages",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<bool>(
                name: "IsSystemDeleted",
                table: "CommunityMessages",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<int>(
                name: "ReportCount",
                table: "CommunityMessages",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<string>(
                name: "ReportReason",
                table: "CommunityMessages",
                type: "nvarchar(100)",
                maxLength: 100,
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_LostFoundReports_ReporterUserId",
                table: "LostFoundReports",
                column: "ReporterUserId");

            migrationBuilder.AddForeignKey(
                name: "FK_LostFoundReports_Users_ReporterUserId",
                table: "LostFoundReports",
                column: "ReporterUserId",
                principalTable: "Users",
                principalColumn: "Id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_LostFoundReports_Users_ReporterUserId",
                table: "LostFoundReports");

            migrationBuilder.DropIndex(
                name: "IX_LostFoundReports_ReporterUserId",
                table: "LostFoundReports");

            migrationBuilder.DropColumn(
                name: "DeletedAt",
                table: "Users");

            migrationBuilder.DropColumn(
                name: "IsActive",
                table: "Users");

            migrationBuilder.DropColumn(
                name: "IsDeleted",
                table: "Users");

            migrationBuilder.DropColumn(
                name: "IsRestricted",
                table: "Users");

            migrationBuilder.DropColumn(
                name: "AdminNote",
                table: "LostFoundReports");

            migrationBuilder.DropColumn(
                name: "Breed",
                table: "LostFoundReports");

            migrationBuilder.DropColumn(
                name: "ColorMarkings",
                table: "LostFoundReports");

            migrationBuilder.DropColumn(
                name: "DateLastSeen",
                table: "LostFoundReports");

            migrationBuilder.DropColumn(
                name: "FinderUserId",
                table: "LostFoundReports");

            migrationBuilder.DropColumn(
                name: "ImageFileName",
                table: "LostFoundReports");

            migrationBuilder.DropColumn(
                name: "IsDisputed",
                table: "LostFoundReports");

            migrationBuilder.DropColumn(
                name: "IsPublished",
                table: "LostFoundReports");

            migrationBuilder.DropColumn(
                name: "OwnerUserId",
                table: "LostFoundReports");

            migrationBuilder.DropColumn(
                name: "PetType",
                table: "LostFoundReports");

            migrationBuilder.DropColumn(
                name: "ReporterName",
                table: "LostFoundReports");

            migrationBuilder.DropColumn(
                name: "ReporterPhone",
                table: "LostFoundReports");

            migrationBuilder.DropColumn(
                name: "ReporterUserId",
                table: "LostFoundReports");

            migrationBuilder.DropColumn(
                name: "ResolvedAt",
                table: "LostFoundReports");

            migrationBuilder.DropColumn(
                name: "ReunitedAt",
                table: "LostFoundReports");

            migrationBuilder.DropColumn(
                name: "Status",
                table: "LostFoundReports");

            migrationBuilder.DropColumn(
                name: "UpdatedAt",
                table: "LostFoundReports");

            migrationBuilder.DropColumn(
                name: "IsAutoFlagged",
                table: "CommunityMessages");

            migrationBuilder.DropColumn(
                name: "IsReported",
                table: "CommunityMessages");

            migrationBuilder.DropColumn(
                name: "IsSystemDeleted",
                table: "CommunityMessages");

            migrationBuilder.DropColumn(
                name: "ReportCount",
                table: "CommunityMessages");

            migrationBuilder.DropColumn(
                name: "ReportReason",
                table: "CommunityMessages");

            migrationBuilder.AlterColumn<string>(
                name: "Type",
                table: "LostFoundReports",
                type: "nvarchar(max)",
                nullable: false,
                oldClrType: typeof(int),
                oldType: "int");

            migrationBuilder.AlterColumn<string>(
                name: "Title",
                table: "LostFoundReports",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "",
                oldClrType: typeof(string),
                oldType: "nvarchar(20)",
                oldMaxLength: 20,
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "Species",
                table: "LostFoundReports",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "",
                oldClrType: typeof(string),
                oldType: "nvarchar(50)",
                oldMaxLength: 50,
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "Phone",
                table: "LostFoundReports",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "",
                oldClrType: typeof(string),
                oldType: "nvarchar(20)",
                oldMaxLength: 20,
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "DateText",
                table: "LostFoundReports",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "",
                oldClrType: typeof(string),
                oldType: "nvarchar(30)",
                oldMaxLength: 30,
                oldNullable: true);
        }
    }
}
