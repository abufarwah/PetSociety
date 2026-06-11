namespace Petsociety.DTOs.AuthDTOs
{
    public class SigninDTOs
    {
        public required string FullName { get; set; }
        public required string Phone { get; set; }
        public required string Email { get; set; }
        public required string Password { get; set; }
        public required string ConfirmPassword { get; set; }
    }
}
