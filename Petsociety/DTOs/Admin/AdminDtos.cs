using System.ComponentModel.DataAnnotations;

namespace Petsociety.DTOs.Admin
{
    /// <summary>Payload for POST /api/admin/users/add</summary>
    public class AddUserDto
    {
        [Required]
        [MaxLength(100)]
        public string FullName { get; set; } = null!;

        [Required]
        [EmailAddress]
        public string Email { get; set; } = null!;

        [Required]
        [MinLength(8, ErrorMessage = "Password must be at least 8 characters.")]
        public string Password { get; set; } = null!;

        /// <summary>Optional role label (e.g. "Pet Owner", "Vet", "User").</summary>
        public string Role { get; set; } = "User";
    }

    /// <summary>Payload for PUT /api/admin/users/{id}/ban — toggles IsRestricted.</summary>
    public class BanUserDto
    {
        /// <summary>
        /// True = restrict the user; False = lift restriction.
        /// </summary>
        public bool IsRestricted { get; set; }

        /// <summary>Optional reason displayed in the admin panel.</summary>
        [MaxLength(300)]
        public string? Reason { get; set; }
    }
}
