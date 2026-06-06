using Petsociety.Models;
using System;
using System.ComponentModel.DataAnnotations;

namespace Petsociety.Model
{
    /// <summary>
    /// Represents a single message posted in a community channel.
    /// </summary>
    public class CommunityMessage
    {
        public long Id { get; set; }

        [Required]
        public long ChannelId { get; set; }

        [Required]
        public int UserId { get; set; }

        [Required]
        [MaxLength(2000)]
        public string MessageText { get; set; } = null!;

        public DateTime SentAt { get; set; } = DateTime.UtcNow;

        // ── Moderation fields ─────────────────────────────────────────────────
        // MIGRATION REQUIRED:
        //   Add-Migration AddMessageModerationV2
        //   Update-Database

        /// <summary>
        /// Set to true when at least one user has submitted a report for this message.
        /// </summary>
        public bool IsReported { get; set; } = false;

        /// <summary>
        /// How many unique users have reported this message.
        /// Admin Dashboard shows messages where ReportCount >= 3 AND IsSystemDeleted == false.
        /// </summary>
        public int ReportCount { get; set; } = 0;

        /// <summary>
        /// Primary report category: "Spam", "Harassment", "Sharing Private Info",
        /// "Hate Speech", "Scam", or "Other".
        /// </summary>
        [MaxLength(100)]
        public string? ReportReason { get; set; }

        /// <summary>
        /// Set to true by <see cref="Petsociety.Services.IMessageModerationService"/>
        /// when the message text matches a SUSPICIOUS keyword (ambiguous / context-dependent).
        /// The original text is preserved and the message is sent for admin review.
        /// Triggers admin review regardless of ReportCount.
        /// </summary>
        public bool IsAutoFlagged { get; set; } = false;

        /// <summary>
        /// Set to true by <see cref="Petsociety.Services.IMessageModerationService"/>
        /// when the message text matches an unambiguous PROFANITY keyword.
        /// The MessageText is OVERWRITTEN with the Arabic tombstone string
        /// "تم حذف هذه الرسالة لمخالفتها سياسات المنصة" and the message is
        /// NOT sent to the admin review queue.
        /// This is the "Tombstone" pattern — the record is kept for audit,
        /// but the content is irreversibly sanitized.
        /// </summary>
        public bool IsSystemDeleted { get; set; } = false;

        // Navigation
        public CommunityChannel? Channel { get; set; }
        public User? User { get; set; }
    }
}