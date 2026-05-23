using System.ComponentModel.DataAnnotations;

namespace Petsociety.DTOs.SubscriptionDTOs
{
    public class PaymentRequestDTO
    {
        [Required]
        public string PackageName { get; set; } = string.Empty;

        [Required]
        public string CardNumber { get; set; } = string.Empty;

        [Required]
        public string CardName { get; set; } = string.Empty;

        [Required]
        public string Expiry { get; set; } = string.Empty;

        [Required]
        public string Cvv { get; set; } = string.Empty;

        public string? Address { get; set; }
        public string? City { get; set; }
        public string? PostalCode { get; set; }
    }
}