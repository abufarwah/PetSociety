using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Petsociety.Model;
using Petsociety.Models;
using System;
using System.Linq;
using System.Net.Http;
using System.Text.Json;
using System.Threading.Tasks;

namespace Petsociety.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AiController : ControllerBase
    {
        private readonly HttpClient _httpClient;
        private readonly PetDbContext _context;

        public AiController(PetDbContext context)
        {
            _httpClient = new HttpClient();
            _context = context;
        }

        // --- Helper: Cosine Similarity ---
        private double CalculateCosineSimilarity(float[] vectorA, float[] vectorB)
        {
            if (vectorA.Length != vectorB.Length) return 0;

            double dotProduct = 0, normA = 0, normB = 0;
            for (int i = 0; i < vectorA.Length; i++)
            {
                dotProduct += vectorA[i] * vectorB[i];
                normA += Math.Pow(vectorA[i], 2);
                normB += Math.Pow(vectorB[i], 2);
            }
            return dotProduct / (Math.Sqrt(normA) * Math.Sqrt(normB));
        }

        [HttpGet("posts")]
        public async Task<IActionResult> GetPosts()
        {
            var posts = await _context.LostFoundReports
                .OrderByDescending(p => p.CreatedAt)
                .Select(p => new {
                    p.Id,
                    p.Type,
                    p.Title,
                    p.Species,
                    p.Description,
                    p.Location,
                    p.DateText,
                    p.ImageUrl,
                    p.Phone
                })
                .ToListAsync();
            return Ok(posts);
        }

        [HttpPost("add-post")]
        public async Task<IActionResult> AddPost([FromForm] Model.LostFoundReport report, IFormFile image)
        {
            if (image == null || image.Length == 0) return BadRequest("Image is required.");

            try
            {
                // Call Python to get features
                using var content = new MultipartFormDataContent();
                using var stream = image.OpenReadStream();
                content.Add(new StreamContent(stream), "image", image.FileName);

                var response = await _httpClient.PostAsync("http://localhost:5000/api/predict", content);
                var aiResult = await response.Content.ReadAsStringAsync();

                if (response.IsSuccessStatusCode)
                {
                    // Parse the feature vector directly into the DB record
                    using var doc = JsonDocument.Parse(aiResult);
                    if (doc.RootElement.TryGetProperty("features", out JsonElement featuresElement))
                    {
                        report.FeatureVector = featuresElement.GetRawText();
                    }
                }

                // TODO: Store 'image' physically or save URL to report.ImageUrl
                report.ImageUrl = "/uploads/mocked_path.jpg"; 

                _context.LostFoundReports.Add(report);
                await _context.SaveChangesAsync();

                return Ok(new { message = "Post added successfully with AI vector!", post = report });
            }
            catch (Exception ex)
            {
                return StatusCode(500, ex.Message);
            }
        }

        [HttpPost("compare")]
        public async Task<IActionResult> CompareImages(IFormFile queryImage)
        {
            if (queryImage == null || queryImage.Length == 0)
            {
                return BadRequest("No image provided.");
            }

            try
            {
                // Call the Python microservice that handles the FastReID model
                using var content = new MultipartFormDataContent();
                using var stream = queryImage.OpenReadStream();
                content.Add(new StreamContent(stream), "image", queryImage.FileName);

                // Assuming Python Flask server is running on localhost:5000
                var response = await _httpClient.PostAsync("http://localhost:5000/api/predict", content);

                if (!response.IsSuccessStatusCode)
                {
                    return StatusCode((int)response.StatusCode, "Failed to get response from AI model microservice.");
                }

                var result = await response.Content.ReadAsStringAsync();

                using var doc = JsonDocument.Parse(result);
                if (!doc.RootElement.TryGetProperty("features", out JsonElement featuresElement))
                    return BadRequest("No features returned from AI.");

                var queryVector = JsonSerializer.Deserialize<float[][]>(featuresElement.GetRawText())[0];

                // Load all existing posts with a feature vector from DB
                var posts = await _context.LostFoundReports
                    .Where(p => !string.IsNullOrEmpty(p.FeatureVector))
                    .ToListAsync();

                // Calculate similarities
                var matches = posts.Select(p => 
                {
                    var postVectorArray = JsonSerializer.Deserialize<float[][]>(p.FeatureVector);
                    var postVector = postVectorArray != null && postVectorArray.Length > 0 ? postVectorArray[0] : new float[0];
                    return new 
                    {
                        Post = p,
                        Confidence = CalculateCosineSimilarity(queryVector, postVector)
                    };
                })
                .Where(m => m.Confidence > 0.6) // Only 60%+ match
                .OrderByDescending(m => m.Confidence)
                .Take(5) // Top 5
                .ToList();

                return Ok(new 
                { 
                    message = "Image compared dynamically with database.",
                    matches = matches 
                });
            }
            catch (System.Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }
    }
}
