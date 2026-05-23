namespace Petsociety.DTOs.Account
{
    public class DashboardDto
    {
        public UserProfileDto User { get; set; } = null!;

        public AccountStatsDto Stats { get; set; } = null!;

        public List<AdoptedPetDto> AdoptedPets { get; set; } = new();
    }
}