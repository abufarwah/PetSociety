using System;
using System.ComponentModel.DataAnnotations;
using Microsoft.AspNetCore.Http;

namespace Petsociety.DTOs.LostFound
{
    public class SaveLostFoundReportDto
    {
        [Required]
        public string Type { get; set; } = null!; // lost | found

        [Required]
        public string PetType { get; set; } = null!;

        public string? Breed { get; set; }

        [Required]
        public string ColorMarkings { get; set; } = null!;

        [Required]
        public DateTime DateLastSeen { get; set; }

        [Required]
        public string Location { get; set; } = null!;

        public string? Description { get; set; }

        [Required]
        public string ReporterName { get; set; } = null!;

        [Required]
        [Phone]
        public string ReporterPhone { get; set; } = null!;

        public IFormFile? ImageFile { get; set; }
    }
}