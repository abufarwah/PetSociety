namespace Petsociety.DTOs.AdoptionRequests
{
    public class SaveAdoptionRequestDto
    {
        public long Id { get; set; } // 0 for Add
        public long PetId { get; set; }
        public string PhoneNumber { get; set; } = null!;
        public string DeliveryMethod { get; set; } = null!;
        public string? Status { get; set; } // optional for update
    }
}