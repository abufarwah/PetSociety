using System;

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

    public class LostFoundReport
    {
        public int Id { get; set; }

        public LostFoundReportType Type { get; set; } = LostFoundReportType.Lost;

        public string PetType { get; set; } = null!; // e.g. Dog, Cat

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

        // navigation to existing user model (optional)
        public Petsociety.Models.User? ReporterUser { get; set; }

        public LostFoundReportStatus Status { get; set; } = LostFoundReportStatus.Open;

        public bool IsPublished { get; set; } = true;

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

        public DateTime? ReunitedAt { get; set; }
        public string FeatureVector { get; internal set; }
        public object Title { get; internal set; }
        public object Species { get; internal set; }
        public object DateText { get; internal set; }
        public object Phone { get; internal set; }
    }
}