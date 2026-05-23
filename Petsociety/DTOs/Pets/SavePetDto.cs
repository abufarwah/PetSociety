using System.Collections.Generic;

namespace Petsociety.DTOs.Pets
{
    public class SavePetDto
    {
        public long Id { get; set; } // 0 for Add, existing Id for Update
        public string Breed { get; set; } = null!;
        public string Type { get; set; } = null!;
        public string AgeCategory { get; set; } = null!;
        public double AgeYears { get; set; }
        public string Gender { get; set; } = null!;
        //public string ImageUrl { get; set; } = null!;
        public IFormFile? Image { get; set; }
        public List<string>? Tags { get; set; } = new();
        public string? Description { get; set; }
        public bool IsAvailable { get; set; } = true;
    }
}