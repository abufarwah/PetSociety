using Microsoft.AspNetCore.Http;
using Petsociety.DTOs.LostFound;

namespace Petsociety.Services
{
    public interface IAiPetMatchingService
    {
        Task<List<SearchMatchDto>> FindSimilarPetsAsync(IFormFile imageFile);
        Task<string?> GetFeatureVectorAsync(IFormFile imageFile);
    }
}