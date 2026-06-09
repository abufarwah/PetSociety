namespace Petsociety.DTOs.Dashboard
{
    /// <summary>
    /// Aggregated KPI snapshot returned by GET /api/dashboard/summary.
    /// All properties are computed live from tables that exist in PetDbContext.
    ///
    /// EXCLUDED (schema columns missing):
    ///   - RestrictedUsersCount  → needs User.IsRestricted
    ///   - ReportedMessagesCount → needs CommunityMessage.IsReported
    /// </summary>
    public class DashboardSummaryDto
    {
        // ── Users ─────────────────────────────────────────────────────────────

        /// <summary>Total registered users on the platform.</summary>
        public int TotalUsers { get; set; }

        // ── Pets ──────────────────────────────────────────────────────────────

        /// <summary>Pets currently listed as available for adoption.</summary>
        public int AvailablePets { get; set; }

        // ── Adoptions ─────────────────────────────────────────────────────────

        /// <summary>Adoption requests awaiting a decision (Status == "Pending").</summary>
        public int PendingAdoptions { get; set; }

        // ── Subscriptions / Revenue ───────────────────────────────────────────

        /// <summary>Number of currently active subscriptions.</summary>
        public int TotalActiveSubscriptions { get; set; }

        /// <summary>
        /// Monthly Recurring Revenue — sum of Price for all active subscriptions.
        /// Returns 0.00 when no active subscriptions exist.
        /// </summary>
        public decimal MonthlyRecurringRevenue { get; set; }

        // ── Community ─────────────────────────────────────────────────────────

        /// <summary>Total number of community chat channels on the platform.</summary>
        public int TotalChatChannels { get; set; }

        // ── AI / Lost & Found ─────────────────────────────────────────────────

        /// <summary>Total Lost &amp; Found reports ever submitted.</summary>
        public int TotalAiReportsProcessed { get; set; }

        /// <summary>
        /// Reports that received a FeatureVector from the FastReID service —
        /// the proxy for "successfully processed by AI".
        /// </summary>
        public int SuccessfulAiMatches { get; set; }

        /// <summary>
        /// Overall AI success rate as a percentage (0–100), rounded to one decimal.
        /// Calculated as: (SuccessfulAiMatches / TotalAiReportsProcessed) × 100.
        /// Returns 0.0 when no reports have been processed.
        ///
        /// NOTE: This is the vector-match success rate, not a user-confirmation rate.
        /// A true user-confirmation rate requires adding LostFoundReport.UserConfirmedMatch
        /// via migration — add that column, then update this calculation.
        /// </summary>
        public double OverallAiSuccessRate { get; set; }
    }
}
