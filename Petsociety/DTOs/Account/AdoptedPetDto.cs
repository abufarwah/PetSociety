namespace Petsociety.DTOs.Account
{
    public class AdoptedPetDto
    {
        public long Id { get; set; }

        public string Name { get; set; } = null!;

        public string Breed { get; set; } = null!;

        public string Type { get; set; } = null!;

        public string Gender { get; set; } = null!;

        public string Age { get; set; } = null!;

        public string Thumbnail { get; set; } = null!;

        public string Status { get; set; } = null!;

        public string RequestStatus { get; set; } = null!;
    }
}