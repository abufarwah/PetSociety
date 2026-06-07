using System;
using System.ComponentModel.DataAnnotations;

namespace Petsociety.Model
{
    public enum LostFoundReportType
    {
        Lost,
        Found
    }

    public enum LostFoundReportStatus
    {
        Open,
        Reunited,
        Closed
    }

    /// <summary>
    /// Unified LostFoundReport entity — single source of truth for both the
    /// AI image-matching pipeline and the Lost &amp; Found admin features.
    /// </summary>
    public class LostFoundReport
    {
        public int Id { get; set; }

        public LostFoundReportType Type { get; set; } = LostFoundReportType.Lost;

        public string PetType { get; set; } = null!;

        public string Breed { get; set; } = string.Empty;

        public string ColorMarkings { get; set; } = string.Empty;

        public DateTime DateLastSeen { get; set; }

        public string Location { get; set; } = null!;

        public string Description { get; set; } = string.Empty;

        public string ImageUrl { get; set; } = string.Empty;

        public string ImageFileName { get; set; } = string.Empty;

        public string ReporterName { get; set; } = null!;

        public string ReporterPhone { get; set; } = null!;

        public int? ReporterUserId { get; set; }

        public Petsociety.Models.User? ReporterUser { get; set; }

        public LostFoundReportStatus Status { get; set; } = LostFoundReportStatus.Open;

        public bool IsPublished { get; set; } = true;

        /// <summary>Feature vector stored as a JSON string from the Python FastReID model.</summary>
        public string? FeatureVector { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

        public DateTime? ReunitedAt { get; set; }

        // Legacy string fields kept for controller backwards-compatibility.
        [MaxLength(20)]
        public string? Title { get; set; }

        [MaxLength(50)]
        public string? Species { get; set; }

        [MaxLength(30)]
        public string? DateText { get; set; }

        [MaxLength(20)]
        public string? Phone { get; set; }
    }
}