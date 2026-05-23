namespace Petsociety.DTOs.Account
{
    public class UserProfileDto
    {
        public string Name { get; set; } = null!;
        public string Email { get; set; } = null!;
        public string MemberSince { get; set; } = null!; // formatted e.g. "December 2025"
        public string AvatarInitial { get; set; } = null!;
    }
}
