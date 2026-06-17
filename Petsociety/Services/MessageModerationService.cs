namespace Petsociety.Services
{
    /// <summary>
    /// Two-tier keyword moderation engine.
    ///
    /// ┌─────────────────────────────────────────────────────────────────────────┐
    /// │ TIER 1 — PROFANITY  (ProfanityKeywords)                                │
    /// │   Unambiguous violations: hate speech, severe insults, explicit content.│
    /// │   Action: TOMBSTONE — overwrite text with Arabic placeholder,           │
    /// │           set IsSystemDeleted = true, skip admin review.                │
    /// ├─────────────────────────────────────────────────────────────────────────┤
    /// │ TIER 2 — SUSPICIOUS  (SuspiciousKeywords)                              │
    /// │   Context-dependent: scam patterns, phone numbers, borderline content.  │
    /// │   Action: FLAG — keep original text, set IsAutoFlagged = true,          │
    /// │           route to admin review queue.                                  │
    /// └─────────────────────────────────────────────────────────────────────────┘
    ///
    /// Classification priority: Profanity is checked first. A message matching
    /// both lists is Tombstoned (the more severe action wins).
    ///
    /// Production recommendation: move both lists to a database table or
    /// appsettings.json so admins can update them without redeployment.
    /// </summary>
    public class MessageModerationService : IMessageModerationService
    {
        // ── TIER 1: PROFANITY — always tombstone, never review ────────────────
        // These are unambiguous, context-free violations.
        private static readonly string[] ProfanityKeywords = new string[]
        {
            // Severe insults & dehumanising language
            "idiot", "moron", "imbecile", "retard","متخلف","يلعن","بلعن","dick","pussy","asshole","horny","sex",
            "you suck", "hate you", "go die", "kill yourself",

            // Hate speech triggers
            "terrorist", "racist", "nazi","دواعش","اقتلو","اذبحو","اضربو",
        };

        // ── TIER 2: SUSPICIOUS — flag for admin review ────────────────────────
        // These are ambiguous in isolation but frequently associated with abuse.
        private static readonly string[] SuspiciousKeywords = new string[]
        {
            // SPAM / bait
            "click here", "win now", "free iphone", "free gift","عرض خاص","عروض","تنزيلات","فرصتك",
            "limited offer", "act now", "claim your prize",

            // SCAM / financial fraud
            "scam", "scammer", "send money", "wire transfer",
            "bank details", "western union", "gift card","دفع كاش",

            // BORDERLINE ABUSE (need context)
            "stupid", "dumb", "jerk", "loser", "shut up","نصاب","اخرس",

            // PRIVACY — Jordanian mobile patterns 
            // Phone sharing may be legitimate (vet giving number) — flag, not delete.
            "079", "077", "078", "+962", "00962",
        };

        // ─────────────────────────────────────────────────────────────────────
        // Primary classification entry point
        // ─────────────────────────────────────────────────────────────────────

        /// <inheritdoc />
        public ModerationAction Classify(string messageText)
        {
            if (string.IsNullOrWhiteSpace(messageText))
                return ModerationAction.Allow;

            var lower = messageText.ToLowerInvariant();

            // Tier 1 checked first — profanity wins over suspicious
            if (MatchesAny(lower, ProfanityKeywords))
                return ModerationAction.TombstoneDelete;

            if (MatchesAny(lower, SuspiciousKeywords))
                return ModerationAction.FlagForReview;

            return ModerationAction.Allow;
        }

        /// <inheritdoc />
        public (string keyword, ModerationAction tier)? GetMatchDetail(string messageText)
        {
            if (string.IsNullOrWhiteSpace(messageText))
                return null;

            var lower = messageText.ToLowerInvariant();

            foreach (var kw in ProfanityKeywords)
                if (lower.Contains(kw))
                    return (kw, ModerationAction.TombstoneDelete);

            foreach (var kw in SuspiciousKeywords)
                if (lower.Contains(kw))
                    return (kw, ModerationAction.FlagForReview);

            return null;
        }

        // ─────────────────────────────────────────────────────────────────────
        // Legacy helpers — kept for backward compatibility
        // ─────────────────────────────────────────────────────────────────────

        /// <inheritdoc />
        public bool ContainsForbiddenKeyword(string messageText)
            => Classify(messageText) != ModerationAction.Allow;

        /// <inheritdoc />
        public string? GetMatchedKeyword(string messageText)
            => GetMatchDetail(messageText)?.keyword;

        // ─────────────────────────────────────────────────────────────────────
        // Private helpers
        // ─────────────────────────────────────────────────────────────────────

        private static bool MatchesAny(string lowerText, string[] keywords)
        {
            foreach (var kw in keywords)
                if (lowerText.Contains(kw))
                    return true;
            return false;
        }
    }
}
