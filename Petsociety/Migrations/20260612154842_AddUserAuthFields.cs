using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Petsociety.Migrations
{
    /// <inheritdoc />
    public partial class AddUserAuthFields : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.InsertData(
                table: "Users",
                columns: new[] { "Id", "DeletedAt", "Email", "FullName", "IsActive", "IsDeleted", "IsRestricted", "PasswordHash", "Phone", "Role" },
                values: new object[] { 1, null, "admin@gmail.com", "Admin", true, false, false, "$2a$11$mQ4C6CANn5zxz4gqw5ldlu6jnpDBvuTe8i0K0rI2w8owp6UFE46cq", "000", "Admin" });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DeleteData(
                table: "Users",
                keyColumn: "Id",
                keyValue: 1);
        }
    }
}
