using System.ComponentModel.DataAnnotations;

namespace Petsociety.DTOs.SubscriptionDTOs
{
    public class PaymentRequestDTO
    {
       
        [Required]
        public int UserId { get; set; } 

        [Required]
        public string PackageName { get; set; } // Basic, Premium, Deluxe

        [Required]
        public decimal TotalAmount { get; set; } 

        [Required]
        public string CardNumber { get; set; }

        [Required]
        public string CardName { get; set; }

        [Required]
        public string Expiry { get; set; }

        [Required]
        public string Cvv { get; set; }

        public string Address { get; set; }
        public string City { get; set; }
        public string PostalCode { get; set; }
    }
}