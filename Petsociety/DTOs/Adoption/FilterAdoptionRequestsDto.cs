namespace Petsociety.DTOs.AdoptionRequests
{
    public class FilterAdoptionRequestsDto
    {
        public long? PetId { get; set; }
        public string? Status { get; set; } // Pending, Approved, Rejected, All
    }
}