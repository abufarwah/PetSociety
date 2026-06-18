using System;

namespace Petsociety.DTOs.AdoptionRequests
{
    public class AdoptionRequestDto
    {
        public long Id { get; set; }
        public long PetId { get; set; }
        public string PetBreed { get; set; } = null!;
        public string PhoneNumber { get; set; } = null!;
        public string DeliveryMethod { get; set; } = null!;
        public string? Governorate { get; set; }
        public string RequesterEmail { get; set; } = string.Empty;
        public string RequesterName { get; set; } = string.Empty;
        public string Status { get; set; } = null!;
        public DateTime CreatedAt { get; set; }
    }
}