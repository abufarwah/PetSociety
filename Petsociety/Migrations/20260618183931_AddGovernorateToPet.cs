using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Petsociety.Migrations
{
    /// <inheritdoc />
    public partial class AddGovernorateToPet : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "Governorate",
                table: "Pets",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Governorate",
                table: "AdoptionRequests",
                type: "nvarchar(max)",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Governorate",
                table: "Pets");

            migrationBuilder.DropColumn(
                name: "Governorate",
                table: "AdoptionRequests");
        }
    }
}
