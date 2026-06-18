using System.Collections.Generic;

namespace Petsociety.DTOs.Pets
{
    public class PetDto
    {
        public long Id { get; set; }
        public string? OwnerPhoneNumber { get; set; }
        public string? HandoverMethod { get; set; }
        public string? Governorate { get; set; }
        public int UserId { get; set; }
        public string Breed { get; set; } = null!;
        public string Type { get; set; } = null!;
        public string AgeCategory { get; set; } = null!;
        public double AgeYears { get; set; }
        public string Gender { get; set; } = null!;
        public string ImageUrl { get; set; } = null!;
        public string Status { get; set; } = "Available";
        public List<string> Tags { get; set; } = new();
        public string? Description { get; set; }
        public bool IsAvailable { get; set; }
    }
}