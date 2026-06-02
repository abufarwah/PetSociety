using Microsoft.AspNetCore.Mvc;
using System.Net.Http;
using System.Threading.Tasks;

namespace Petsociety.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AiController : ControllerBase
    {
        private readonly HttpClient _httpClient;

        public AiController()
        {
            _httpClient = new HttpClient();
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

                // We return the raw JSON from Python back to the Frontend
                return Content(result, "application/json");
            }
            catch (System.Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }
    }
}
