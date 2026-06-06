using System.ComponentModel.DataAnnotations;

namespace Petsociety.DTOs.SubscriptionDTOs
{
    public class PaymentRequestDTO
    {
        [Required]
        public string PackageName { get; set; } = string.Empty;

        [Required]
        [RegularExpression(@"^\d{16}$",
            ErrorMessage = "Card number must be 16 digits.")]
        public string CardNumber { get; set; } = string.Empty;

        [Required]
        [MinLength(3)]
        public string CardName { get; set; } = string.Empty;

        [Required]
        [RegularExpression(@"^(0[1-9]|1[0-2])\/\d{2}$",
           ErrorMessage = "Expiry must be MM/YY")]
        public string Expiry { get; set; } = string.Empty;

        [Required]
        [RegularExpression(@"^\d{3}$",
           ErrorMessage = "CVV must be 3 digits.")]
        public string Cvv { get; set; } = string.Empty;

        public string? Address { get; set; }
        public string? City { get; set; }
        public string? PostalCode { get; set; }
    }
}