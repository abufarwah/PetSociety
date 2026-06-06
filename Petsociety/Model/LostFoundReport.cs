using System;
using System.ComponentModel.DataAnnotations;

namespace Petsociety.Models
{
    public class LostFoundReport
    {
        public int Id { get; set; }

        [Required]
        public string Type { get; set; } = null!; // "lost" or "found"

        [Required]
        public string Title { get; set; } = null!;

        [Required]
        public string Species { get; set; } = null!;

        public string Description { get; set; } = string.Empty;

        [Required]
        public string Location { get; set; } = null!;

        [Required]
        public string DateText { get; set; } = null!;

        [Required]
        public string ImageUrl { get; set; } = null!;

        [Required]
        public string Phone { get; set; } = null!;

        // This will strictly store the generated float[] as a JSON string from python FastReID model.
        public string? FeatureVector { get; set; } 

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}