using System.Collections.Generic;

namespace Petsociety.DTOs.Pets
{
    public class PetDto
    {
        public long Id { get; set; }
        public string Breed { get; set; } = null!;
        public string Type { get; set; } = null!;
        public string AgeCategory { get; set; } = null!;
        public double AgeYears { get; set; }
        public string Gender { get; set; } = null!;
        public string ImageUrl { get; set; } = null!;
        public List<string> Tags { get; set; } = new();
        public string? Description { get; set; }
        public bool IsAvailable { get; set; }
    }
}