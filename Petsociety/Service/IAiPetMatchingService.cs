using Microsoft.AspNetCore.Http;
using Petsociety.DTOs.LostFound;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Petsociety.Services
{
    public interface IAiPetMatchingService
    {
        Task<List<SearchMatchDto>> FindSimilarPetsAsync(IFormFile imageFile);
        Task<string?> ExtractFeatureVectorAsync(IFormFile imageFile);
    }
}