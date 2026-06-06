using Microsoft.AspNetCore.Http;
using Petsociety.DTOs.LostFound;
using Petsociety.Model;
using Petsociety.Services;

namespace Petsociety.Services
{
    public class AiPetMatchingService : IAiPetMatchingService
    {
        private readonly PetDbContext _db;

        public AiPetMatchingService(PetDbContext db)
        {
            _db = db;
        }

        public async Task<List<SearchMatchDto>> FindSimilarPetsAsync(IFormFile imageFile)
        {
            // =========================================
            // AI MODEL GOES HERE
            // =========================================

            // هنا رح تحط:
            // - استدعاء الموديل
            // - مقارنة الصور
            // - استخراج similarity score

            // مؤقتاً:
            await Task.CompletedTask;

            return new List<SearchMatchDto>();
        }
    }
}
