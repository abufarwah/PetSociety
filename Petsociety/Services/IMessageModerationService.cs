namespace Petsociety.Services
{
    /// <summary>
    /// Result of scanning a community message through the moderation pipeline.
    /// </summary>
    public enum ModerationAction
    {
        /// <summary>No keyword matched. Allow the message through normally.</summary>
        Allow,

        /// <summary>
        /// A SUSPICIOUS keyword was matched (ambiguous / context-dependent).
        /// Action: keep the original text, set IsAutoFlagged = true, route to admin review.
        /// </summary>
        FlagForReview,

        /// <summary>
        /// An unambiguous PROFANITY keyword was matched.
        /// Action: overwrite MessageText with the Arabic tombstone string,
        /// set IsSystemDeleted = true, and do NOT route to admin review.
        /// </summary>
        TombstoneDelete
    }

    /// <summary>
    /// The Arabic placeholder text that replaces profane message content.
    /// Kept as a constant so it is defined in exactly one place.
    /// </summary>
    public static class ModerationConstants
    {
        public const string TombstoneText =
            "تم حذف هذه الرسالة لمخالفتها سياسات المنصة";
    }

    /// <summary>
    /// Contract for the two-tier auto-moderation service.
    ///
    /// Tier 1 — Profanity (unambiguous offenses):
    ///   → Action: TombstoneDelete (overwrite text, mark IsSystemDeleted = true)
    ///   → NOT sent to admin review queue.
    ///
    /// Tier 2 — Suspicious (context-dependent / borderline):
    ///   → Action: FlagForReview (keep text, set IsAutoFlagged = true)
    ///   → Sent to admin review queue when IsAutoFlagged || ReportCount >= 3.
    /// </summary>
    public interface IMessageModerationService
    {
        /// <summary>
        /// Classifies a message and returns the <see cref="ModerationAction"/> the
        /// system should apply to it. This is the primary entry point for all
        /// moderation decisions.
        /// </summary>
        /// <param name="messageText">The raw message text to classify.</param>
        /// <returns>The recommended <see cref="ModerationAction"/>.</returns>
        ModerationAction Classify(string messageText);

        /// <summary>
        /// Returns the first matched keyword and which tier it belongs to,
        /// or <c>null</c> if no keyword was matched. Used for audit logging.
        /// </summary>
        (string keyword, ModerationAction tier)? GetMatchDetail(string messageText);

        // ── Legacy helpers (kept for backward compatibility) ──────────────────

        /// <summary>
        /// Returns true if the text matches ANY keyword in either tier.
        /// Prefer <see cref="Classify"/> for new code.
        /// </summary>
        bool ContainsForbiddenKeyword(string messageText);

        /// <summary>
        /// Returns the first matched keyword from either tier, or null.
        /// Prefer <see cref="GetMatchDetail"/> for new code.
        /// </summary>
        string? GetMatchedKeyword(string messageText);
    }
}
