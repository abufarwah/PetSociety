using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Petsociety.Migrations
{
    /// <inheritdoc />
    public partial class AddUserSoftDeleteAndRestriction : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // Fix: set IsActive = true, IsDeleted = false for ALL existing users
            // because SQL Server defaulted these columns to 0 (false) when the
            // columns were first added, which caused login to fail for everyone.
            migrationBuilder.Sql(
                "UPDATE [Users] SET [IsActive] = 1, [IsDeleted] = 0, [IsRestricted] = 0 " +
                "WHERE [IsActive] = 0 AND [IsDeleted] = 0"
            );
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {

        }
    }
}
