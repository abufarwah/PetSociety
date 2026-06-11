using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Petsociety.DTOs.Admin;
using Petsociety.Model;
using Petsociety.Models;
using Swashbuckle.AspNetCore.Annotations;
using BCrypt.Net;

namespace Petsociety.Controllers
{
    /// <summary>
    /// Admin-only user management endpoints.
    ///
    /// MIGRATIONS REQUIRED before full functionality is available:
    ///   Add-Migration AddUserSoftDeleteAndRestriction
    ///   Update-Database
    ///
    /// This adds: IsDeleted, IsActive, IsRestricted, DeletedAt to the User table.
    /// Until then, the delete and ban endpoints are partially scaffolded (see comments).
    /// </summary>
    /// 

    [Authorize(Roles = "Admin")]
    [Route("api/admin/users")]
    [ApiController]
    public class AdminController : ControllerBase
    {
        private readonly PetDbContext _context;

        public AdminController(PetDbContext context)
        {
            _context = context;
        }

        // ── POST /api/admin/users/add ─────────────────────────────────────────

        /// <summary>Creates a new user account.</summary>
        /// <response code="201">User created successfully.</response>
        /// <response code="400">Validation failed or email already registered.</response>
        [HttpPost("add")]
        [SwaggerOperation(Summary = "Add a new user", Tags = new[] { "Admin - Users" })]
        [ProducesResponseType(StatusCodes.Status201Created)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        public async Task<IActionResult> AddUser([FromBody] AddUserDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            bool emailExists = await _context.Users
                .AsNoTracking()
                .AnyAsync(u => u.Email == dto.Email);

            if (emailExists)
                return BadRequest(new { error = "A user with this email already exists." });

            var user = new User
            {
                FullName     = dto.FullName,
                Email        = dto.Email,
                //PasswordHash = BCryptPlaceholder(dto.Password),
                PasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.Password),
                IsActive     = true,
                IsDeleted    = false,
                IsRestricted = false
            };

            _context.Users.Add(user);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(AddUser), new { id = user.Id },
                new { user.Id, user.FullName, user.Email });
        }

        // ── DELETE /api/admin/users/{id} ──────────────────────────────────────

        /// <summary>
        /// Soft-deletes a user account.
        ///
        /// WHY SOFT DELETE?
        /// A hard DELETE on a user cascades through all foreign key relationships
        /// (Pets, AdoptionRequests, Subscriptions, Payments, LostFoundReports, CommunityMessages)
        /// causing data loss and audit gaps. Soft delete preserves the full history
        /// by setting IsDeleted = true and IsActive = false.
        ///
        /// ⚠️ REQUIRES MIGRATION: After running Add-Migration AddUserSoftDeleteAndRestriction,
        ///    uncomment the soft-delete block and remove the hard-delete fallback.
        /// </summary>
        /// <response code="200">User soft-deleted.</response>
        /// <response code="404">User not found.</response>
        [HttpDelete("{id}")]
        [SwaggerOperation(
            Summary     = "Soft-delete a user (sets IsDeleted = true, IsActive = false)",
            Description = "Preserves the user record and all related data. The user cannot log in after this action.",
            Tags        = new[] { "Admin - Users" }
        )]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> DeleteUser(int id)
        {
            var user = await _context.Users.FindAsync(id);
            if (user is null)
                return NotFound(new { error = $"User with id {id} not found." });

            // ── SOFT DELETE (uncomment once migration is applied) ──────────────
            // user.IsDeleted  = true;
            // user.IsActive   = false;
            // user.DeletedAt  = DateTime.UtcNow;
            // await _context.SaveChangesAsync();
            // return Ok(new
            // {
            //     userId    = user.Id,
            //     isDeleted = true,
            //     deletedAt = user.DeletedAt,
            //     message   = $"User '{user.FullName}' has been soft-deleted. All related data is preserved."
            // });
            // ────────────────────────────────────────────────────────────────────

            // TEMPORARY FALLBACK — hard delete until migration is applied.
            // Replace with soft-delete block above after migration.
            _context.Users.Remove(user);
            await _context.SaveChangesAsync();

            return Ok(new
            {
                userId  = user.Id,
                message = $"User '{user.FullName}' was hard-deleted (temporary — pending migration)."
            });
        }

        // ── PUT /api/admin/users/{id}/ban ─────────────────────────────────────

        /// <summary>
        /// Toggles the IsRestricted flag on a user (ban / lift restriction).
        ///
        /// ⚠️ REQUIRES MIGRATION: Add-Migration AddUserSoftDeleteAndRestriction
        /// </summary>
        /// <response code="200">User ban status updated.</response>
        /// <response code="404">User not found.</response>
        /// <response code="501">Schema migration not yet applied.</response>
        [HttpPut("{id}/ban")]
        [SwaggerOperation(Summary = "Ban or unban a user (toggle IsRestricted)", Tags = new[] { "Admin - Users" })]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status501NotImplemented)]
        public async Task<IActionResult> BanUser(int id, [FromBody] BanUserDto dto)
        {
            var user = await _context.Users.FindAsync(id);
            if (user is null)
                return NotFound(new { error = $"User with id {id} not found." });

            // TODO: Uncomment once Add-Migration AddUserSoftDeleteAndRestriction is applied.
            // ─────────────────────────────────────────────────────────────────
            // user.IsRestricted = dto.IsRestricted;
            // await _context.SaveChangesAsync();
            // return Ok(new
            // {
            //     userId       = user.Id,
            //     isRestricted = user.IsRestricted,
            //     message      = dto.IsRestricted
            //                    ? $"User '{user.FullName}' has been restricted."
            //                    : $"User '{user.FullName}' restriction has been lifted."
            // });
            // ─────────────────────────────────────────────────────────────────

            return StatusCode(StatusCodes.Status501NotImplemented, new
            {
                error = "Ban functionality requires running: Add-Migration AddUserSoftDeleteAndRestriction && Update-Database, " +
                        "then uncomment the logic in AdminController.BanUser."
            });
        }

        // ── Private helpers ───────────────────────────────────────────────────

        /// <summary>
        /// Placeholder — replace with BCrypt.Net.BCrypt.HashPassword(password)
        /// once the BCrypt.Net-Next NuGet package is installed.
        /// </summary>
        //private static string BCryptPlaceholder(string password)
        //    => Convert.ToBase64String(System.Text.Encoding.UTF8.GetBytes(password));
    }
}
