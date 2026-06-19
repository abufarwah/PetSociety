using Microsoft.AspNetCore.Http;
using Petsociety.DTOs.LostFound;
using Petsociety.Model;
using System.Text.Json;
using System.Net.Http.Headers;

namespace Petsociety.Services
{
    public class AiPetMatchingService : IAiPetMatchingService
    {
        private readonly PetDbContext _db;
        private readonly HttpClient _httpClient;
        private readonly string _pythonApiUrl = "http://localhost:5000";

        public AiPetMatchingService(PetDbContext db)
        {
            _db = db;
            _httpClient = new HttpClient();
        }

        public async Task<string?> ExtractFeatureVectorAsync(IFormFile imageFile)
        {
            if (imageFile == null || imageFile.Length == 0) return null;

            try
            {
                using var content = new MultipartFormDataContent();
                using var stream = imageFile.OpenReadStream();
                var streamContent = new StreamContent(stream);
                streamContent.Headers.ContentType = new MediaTypeHeaderValue(imageFile.ContentType);
                content.Add(streamContent, "image", imageFile.FileName);

                var response = await _httpClient.PostAsync($"{_pythonApiUrl}/api/predict", content);
                if (!response.IsSuccessStatusCode) return null;

                var result = await response.Content.ReadAsStringAsync();
                using var doc = JsonDocument.Parse(result);
                if (doc.RootElement.TryGetProperty("features", out var featuresElement))
                {
                    return featuresElement.GetRawText();
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error extracting features: {ex.Message}");
            }
            return null;
        }

        public async Task<List<SearchMatchDto>> FindSimilarPetsAsync(IFormFile imageFile)
        {
            var result = new List<SearchMatchDto>();
            if (imageFile == null || imageFile.Length == 0)
                return result;

            try
            {
                // 1. Get query features
                var queryFeatureStr = await ExtractFeatureVectorAsync(imageFile);
                if (string.IsNullOrEmpty(queryFeatureStr)) return result;

                var queryFeature = JsonSerializer.Deserialize<List<double>>(queryFeatureStr);
                if (queryFeature == null || queryFeature.Count == 0) return result;

                // 2. Get candidates from DB
                var reports = _db.LostFoundReports
                    .Where(r => r.IsPublished && !string.IsNullOrEmpty(r.FeatureVector))
                    .ToList();

                if (!reports.Any()) return result;

                var candidatesList = new List<object>();
                foreach (var r in reports)
                {
                    try
                    {
                        var fv = JsonSerializer.Deserialize<List<double>>(r.FeatureVector!);
                        if (fv != null)
                        {
                            candidatesList.Add(new { id = r.Id, feature = fv });
                        }
                    }
                    catch { }
                }

                // 3. Compare via python API
                var matchPayload = new
                {
                    query_feature = queryFeature,
                    candidates = candidatesList,
                    threshold = 0.0
                };

                var matchContent = new StringContent(JsonSerializer.Serialize(matchPayload), System.Text.Encoding.UTF8, "application/json");
                var matchRes = await _httpClient.PostAsync($"{_pythonApiUrl}/api/match", matchContent);
                if (!matchRes.IsSuccessStatusCode) return result;

                var matchJson = await matchRes.Content.ReadAsStringAsync();
                using var matchDoc = JsonDocument.Parse(matchJson);
                if (!matchDoc.RootElement.TryGetProperty("matches", out var matchesElement)) return result;

                // 4. Map to DTOs
                foreach (var m in matchesElement.EnumerateArray())
                {
                    var id = m.GetProperty("id").GetInt32();
                    var score = m.GetProperty("score").GetDouble();

                    var report = reports.FirstOrDefault(x => x.Id == id);
                    if (report != null)
                    {
                        result.Add(new SearchMatchDto
                        {
                            Post = new LostFoundReportDto
                            {
                                Id = report.Id,
                                Type = report.Type.ToString().ToLower(),
                                PetType = report.PetType,
                                Breed = report.Breed,
                                ColorMarkings = report.ColorMarkings,
                                DateLastSeen = report.DateLastSeen,
                                Location = report.Location,
                                Excerpt = (report.Description ?? "").Length > 200
                                    ? report.Description.Substring(0, 200) + "..."
                                    : report.Description ?? "",
                                ImageUrl = report.ImageUrl,
                                ReporterName = report.ReporterName,
                                ReporterUserId = report.ReporterUserId,
                                ReporterPhone = report.ReporterPhone,
                                Status = report.Status.ToString(),
                                CreatedAt = report.CreatedAt
                            },
                            Confidence = score
                        });
                    }
                }

                return result.OrderByDescending(r => r.Confidence).ToList();
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error in FindSimilarPetsAsync: {ex.Message}");
                return result;
            }
        }
    }
}
