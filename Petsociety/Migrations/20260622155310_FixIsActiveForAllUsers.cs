using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Petsociety.Migrations
{
    /// <inheritdoc />
    public partial class FixIsActiveForAllUsers : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // BUG FIX: The AddUserSoftDeleteAndRestriction migration had an empty body.
            // When SQL Server added the IsActive column, it defaulted all existing rows to 0 (false).
            // This caused the AuthController to reject ALL logins with "Account is inactive".
            // This migration sets IsActive=true for all legitimate users (not soft-deleted ones).
            migrationBuilder.Sql(
                "UPDATE [Users] SET [IsActive] = 1 WHERE [IsDeleted] = 0 AND [IsActive] = 0"
            );
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            // Cannot reverse — setting active users back to inactive would break logins.
        }
    }
}
