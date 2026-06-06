using System.ComponentModel.DataAnnotations;
using Microsoft.AspNetCore.Http;

namespace Petsociety.DTOs.LostFound
{
    public class SearchSimilarRequestDto
    {
        [Required]
        public IFormFile? ImageFile { get; set; }
    }
}