namespace Petsociety.DTOs.Account
{
    public class AdoptedPetDto
    {
        public long Id { get; set; }
        public string Name { get; set; } = null!; // Breed or pet name
        public string Thumbnail { get; set; } = null!; // ImageUrl
        public string Status { get; set; } = null!; // e.g. "Approved"
    }
}

