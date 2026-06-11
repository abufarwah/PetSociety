using System.ComponentModel.DataAnnotations;

namespace Petsociety.Models
{
    public class User
    {
        [Key]
        public int Id { get; set; }

        [Required]
        [MaxLength(100)]
        public string FullName { get; set; } = null!;
        [Required]
        public string? Phone { get; set; }

        [Required]
        [EmailAddress]
        public string Email { get; set; } = null!;

        [Required]
        public string PasswordHash { get; set; } = null!;

        public string Role { get; set; } = "User";

        // ── Moderation / Lifecycle fields ──────────────────────────────────────
        // MIGRATION REQUIRED to activate these fields:
        //   Add-Migration AddUserSoftDeleteAndRestriction
        //   Update-Database

        /// <summary>
        /// Soft-delete flag. When true, the user record is retained in the database
        /// (preserving foreign-key relationships with Pets, AdoptionRequests, Subscriptions, etc.)
        /// but treated as deleted in all application queries.
        /// Never use EF hard-delete (Remove) for users.
        /// </summary>
        public bool IsDeleted { get; set; } = false;

        /// <summary>
        /// General active/inactive state. Set to false on soft-delete or manual deactivation.
        /// Complements IsDeleted: a user can be inactive without being deleted.
        /// </summary>
        public bool IsActive { get; set; } = true;

        /// <summary>
        /// Community restriction flag. When true, the user cannot post or send messages
        /// in community channels. Toggled by PUT /api/admin/users/{id}/ban.
        /// </summary>
        public bool IsRestricted { get; set; } = false;

        /// <summary>ISO 8601 timestamp of when the soft-delete action was performed.</summary>
        public DateTime? DeletedAt { get; set; }
    }
}