using System;
using System.ComponentModel.DataAnnotations;

namespace Petsociety.Model
{
    public class AdoptionRequest
    {
        public long Id { get; set; }

        [Required]
        public long PetId { get; set; }

        [Required]
        public string PhoneNumber { get; set; } = null!;

        [Required]
        public string DeliveryMethod { get; set; } = null!; // Delivery or Clinic Pickup

        public string Status { get; set; } = "Pending"; // Pending, Approved, Rejected

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}