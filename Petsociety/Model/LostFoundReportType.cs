using System;
using System.ComponentModel.DataAnnotations;

namespace Petsociety.Model
{
    // ─────────────────────────────────────────────────────────────────────────────
    // Enums
    // ─────────────────────────────────────────────────────────────────────────────

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

    // ─────────────────────────────────────────────────────────────────────────────
    // Entity — UNIFIED model (merged from both branches)
    //
    // This is the SINGLE source of truth for the LostFoundReport entity.
    // Do NOT create another LostFoundReport class in Petsociety.Models (plural).
    //
    // MIGRATIONS REQUIRED for the new columns added in the Admin Dashboard branch:
    //   Add-Migration AddLostFoundDisputeTracking
    //   Update-Database
    // ─────────────────────────────────────────────────────────────────────────────
    public class LostFoundReport
    {
        public int Id { get; set; }

        // ── Core AI / image matching fields (teammate's branch) ───────────────

        public LostFoundReportType Type { get; set; } = LostFoundReportType.Lost;

        public string PetType { get; set; } = null!;        // e.g. Dog, Cat

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

        // Navigation to existing user model (optional)
        public Petsociety.Models.User? ReporterUser { get; set; }

        public LostFoundReportStatus Status { get; set; } = LostFoundReportStatus.Open;

        public bool IsPublished { get; set; } = true;

        // This stores the generated float[] as a JSON string from the Python FastReID model.
        public string? FeatureVector { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

        public DateTime? ReunitedAt { get; set; }

        // ── Legacy scalar fields (original branch — kept for backwards compat) ─
        // These are string equivalents of the enum/structured fields above.
        // Some controllers (LostFoundReportsController) may still reference these
        // until a full schema consolidation is done.
        [MaxLength(20)]
        public string? Title { get; set; }

        [MaxLength(50)]
        public string? Species { get; set; }

        [MaxLength(30)]
        public string? DateText { get; set; }

        [MaxLength(20)]
        public string? Phone { get; set; }

        // ── AI Dispute Tracking (Admin Dashboard branch) ──────────────────────
        // MIGRATION REQUIRED: Add-Migration AddLostFoundDisputeTracking

        /// <summary>
        /// Set to true when the Finder and the reported Owner give conflicting
        /// responses to the AI match suggestion. Requires admin adjudication.
        /// </summary>
        public bool IsDisputed { get; set; } = false;

        /// <summary>The User.Id of the person who submitted the "found" report.</summary>
        public int? FinderUserId { get; set; }

        /// <summary>The User.Id of the person who submitted the matching "lost" report.</summary>
        public int? OwnerUserId { get; set; }

        /// <summary>
        /// Free-text admin note recorded when reviewing or resolving a dispute.
        /// Preserved even after resolution for audit trail purposes.
        /// </summary>
        [MaxLength(500)]
        public string? AdminNote { get; set; }

        /// <summary>
        /// UTC timestamp when an admin resolved the dispute.
        /// Null while the dispute is still open.
        /// </summary>
        public DateTime? ResolvedAt { get; set; }
    }
}