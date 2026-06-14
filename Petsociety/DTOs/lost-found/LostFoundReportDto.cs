using System;

namespace Petsociety.DTOs.LostFound
{
    public class LostFoundReportDto
    {
        public int Id { get; set; }
        public string Type { get; set; } = null!;
        public string PetType { get; set; } = null!;
        public string Breed { get; set; } = string.Empty;
        public string ColorMarkings { get; set; } = string.Empty;
        public DateTime DateLastSeen { get; set; }
        public string Location { get; set; } = null!;
        public string Excerpt { get; set; } = string.Empty;
        public string ImageUrl { get; set; } = string.Empty;
        public string ReporterName { get; set; } = null!;
        public int? ReporterUserId { get; set; }
        public string? ReporterPhone { get; set; } = null;
        public string Status { get; set; } = "Open";
        public DateTime CreatedAt { get; set; }
    }
}