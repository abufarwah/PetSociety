using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using Petsociety.DTOs.LostFound;
using Petsociety.Model;
using System.Net.Http;
using System.Text.Json;

namespace Petsociety.Services
{
    public class AiPetMatchingService : IAiPetMatchingService
    {
        private readonly PetDbContext _db;
        private readonly HttpClient _httpClient;
        private readonly string _aiMicroserviceUrl = "http://localhost:5000/api/predict";

        public AiPetMatchingService(PetDbContext db)
        {
            _db = db;
            _httpClient = new HttpClient();
        }

        public async Task<string?> GetFeatureVectorAsync(IFormFile imageFile)
        {
            if (imageFile == null || imageFile.Length == 0) return null;

            try
            {
                using var content = new MultipartFormDataContent();
                using var stream = imageFile.OpenReadStream();
                content.Add(new StreamContent(stream), "image", imageFile.FileName);

                var response = await _httpClient.PostAsync(_aiMicroserviceUrl, content);
                if (response.IsSuccessStatusCode)
                {
                    var aiResult = await response.Content.ReadAsStringAsync();
                    using var doc = JsonDocument.Parse(aiResult);
                    if (doc.RootElement.TryGetProperty("features", out JsonElement featuresElement))
                    {
                        return featuresElement.GetRawText();
                    }
                }
            }
            catch (Exception ex)
            {
                // Handle or log exception
                Console.WriteLine($"Error getting feature vector: {ex.Message}");
            }
            return null;
        }

        public async Task<List<SearchMatchDto>> FindSimilarPetsAsync(IFormFile imageFile)
        {
            var queryVectorString = await GetFeatureVectorAsync(imageFile);
            if (string.IsNullOrEmpty(queryVectorString))
                return new List<SearchMatchDto>();

            try
            {
                var queryVectorArray = JsonSerializer.Deserialize<float[][]>(queryVectorString);
                var queryVector = queryVectorArray != null && queryVectorArray.Length > 0 ? queryVectorArray[0] : Array.Empty<float>();

                if (queryVector.Length == 0) return new List<SearchMatchDto>();

                var posts = await _db.LostFoundReports
                    .Where(p => !string.IsNullOrEmpty(p.FeatureVector) && p.IsPublished)
                    .ToListAsync();

                var matches = posts.Select(p => 
                {
                    var postVectorArray = JsonSerializer.Deserialize<float[][]>(p.FeatureVector!);
                    var postVector = postVectorArray != null && postVectorArray.Length > 0 ? postVectorArray[0] : Array.Empty<float>();
                    return new 
                    {
                        Post = p,
                        Confidence = CalculateCosineSimilarity(queryVector, postVector)
                    };
                })
                .Where(m => m.Confidence > 0.6) // Only 60%+ match
                .OrderByDescending(m => m.Confidence)
                .Take(5) // Top 5
                .Select(m => new SearchMatchDto
                {
                    Post = new LostFoundReportDto
                    {
                        Id = m.Post.Id,
                        Type = m.Post.Type.ToString().ToLower(),
                        PetType = m.Post.PetType,
                        Breed = m.Post.Breed,
                        ColorMarkings = m.Post.ColorMarkings,
                        DateLastSeen = m.Post.DateLastSeen,
                        Location = m.Post.Location,
                        Excerpt = (m.Post.Description ?? "").Length > 200
                            ? m.Post.Description.Substring(0, 200) + "..."
                            : m.Post.Description,
                        ImageUrl = m.Post.ImageUrl,
                        ReporterName = m.Post.ReporterName,
                        ReporterUserId = m.Post.ReporterUserId,
                        ReporterPhone = m.Post.ReporterPhone,
                        Status = m.Post.Status.ToString(),
                        CreatedAt = m.Post.CreatedAt
                    },
                    Confidence = m.Confidence
                })
                .ToList();

                return matches;
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error comparing feature vectors: {ex.Message}");
                return new List<SearchMatchDto>();
            }
        }

        private double CalculateCosineSimilarity(float[] vectorA, float[] vectorB)
        {
            if (vectorA.Length != vectorB.Length || vectorA.Length == 0) return 0;

            double dotProduct = 0, normA = 0, normB = 0;
            for (int i = 0; i < vectorA.Length; i++)
            {
                dotProduct += vectorA[i] * vectorB[i];
                normA += Math.Pow(vectorA[i], 2);
                normB += Math.Pow(vectorB[i], 2);
            }
            if (normA == 0 || normB == 0) return 0;
            return dotProduct / (Math.Sqrt(normA) * Math.Sqrt(normB));
        }
    }
}
