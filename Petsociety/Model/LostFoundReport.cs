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

        // ── AI Dispute Tracking ────────────────────────────────────────────────
        // MIGRATION REQUIRED:
        //   Add-Migration AddLostFoundDisputeTracking
        //   Update-Database

        /// <summary>
        /// Set to true when the Finder and the reported Owner disagree on the AI
        /// match result (one confirms, the other rejects). These cases require
        /// manual admin adjudication before the case can be closed.
        /// </summary>
        public bool IsDisputed { get; set; } = false;

        /// <summary>
        /// The User.Id of the person who submitted the "found" report.
        /// Used to distinguish the two parties in a dispute.
        /// </summary>
        public int? FinderUserId { get; set; }

        /// <summary>
        /// The User.Id of the person who submitted the matching "lost" report.
        /// </summary>
        public int? OwnerUserId { get; set; }

        /// <summary>
        /// Free-text note added by the admin when reviewing or resolving a dispute.
        /// Preserved even after resolution for audit trail purposes.
        /// </summary>
        [MaxLength(500)]
        public string? AdminNote { get; set; }

        /// <summary>
        /// Timestamp when an admin resolved the dispute.
        /// Null while the dispute is still open.
        /// </summary>
        public DateTime? ResolvedAt { get; set; }
    }
}