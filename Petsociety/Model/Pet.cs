using Petsociety.Model;
using System.ComponentModel.DataAnnotations;
using System;

namespace Petsociety.Model
{
    public class Pet
    {
        public long Id { get; set; }
        public string? OwnerPhoneNumber { get; set; }
        public string? HandoverMethod { get; set; }
        public string? Governorate { get; set; }
        public int UserId { get; set; }

        [Required]
        public string Breed { get; set; } = null!;

        [Required]
        public string Type { get; set; } = null!; // Dog, Cat, ...

        [Required]
        public string AgeCategory { get; set; } = null!; // Baby, Young, Adult

        public double AgeYears { get; set; }

        [Required]
        public string Gender { get; set; } = null!; // Male, Female

        [Required]
        public string ImageUrl { get; set; } = null!;

        // Stored as comma separated values to keep model simple and match controller-style LINQ
        public string Tags { get; set; } = string.Empty;

        public string? Description { get; set; }

        public bool IsAvailable { get; set; } = true;

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public string Status { get; set; } = "Available";
    }
}