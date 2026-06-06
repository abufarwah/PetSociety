namespace Petsociety.DTOs.Pets
{
    public class FilterPetsDto
    {
        public string? Breed { get; set; }
        public string? Type { get; set; } // All, Dog, Cat, ...
        public string? AgeCategory { get; set; } // All, Baby, Young, Adult
        public string? Gender { get; set; } // All, Male, Female
        public string? Tag { get; set; } // All or specific tag
    }
}