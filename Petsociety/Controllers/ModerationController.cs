using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Petsociety.Model;
using Petsociety.Services;
using Swashbuckle.AspNetCore.Annotations;

namespace Petsociety.Controllers
{
    /// <summary>
    /// Admin-only moderation endpoints for community messages and AI dispute resolution.
    ///
    /// MIGRATIONS REQUIRED before these endpoints return live data:
    ///   Add-Migration AddMessageModerationV2     ← adds IsSystemDeleted to CommunityMessage
    ///   Add-Migration AddLostFoundDisputeTracking ← adds IsDisputed, FinderUserId, etc.
    ///   Update-Database
    /// </summary>
    [Route("api/moderation")]
    [ApiController]
    public class ModerationController : ControllerBase
    {
        private readonly PetDbContext _context;
        private readonly IMessageModerationService _moderation;

        public ModerationController(PetDbContext context, IMessageModerationService moderation)
        {
            _context   = context;
            _moderation = moderation;
        }

        // ═══════════════════════════════════════════════════════════════════════
        // COMMUNITY MESSAGE MODERATION
        // ═══════════════════════════════════════════════════════════════════════

        // ── GET /api/moderation/flagged-messages ──────────────────────────────

        /// <summary>
        /// Returns messages that require admin review.
        ///
        /// Filter logic (hierarchical threshold architecture):
        ///   • IsSystemDeleted == false  — Tombstoned messages never appear in the queue;
        ///     they are handled automatically by the service pipeline.
        ///   • AND (IsAutoFlagged == true OR ReportCount >= threshold)
        ///     — Only messages that a human or the AI flagged surface here.
        ///
        /// This ensures admins ONLY see actionable items and are never flooded with
        /// clean messages or already-tombstoned profanity.
        /// </summary>
        [HttpGet("flagged-messages")]
        [SwaggerOperation(
            Summary     = "Get messages requiring admin review",
            Description = "Returns (IsAutoFlagged OR ReportCount >= threshold) AND IsSystemDeleted == false, ordered by severity.",
            OperationId = "Moderation_GetFlaggedMessages",
            Tags        = new[] { "Moderation" }
        )]
        [ProducesResponseType(StatusCodes.Status200OK)]
        public async Task<IActionResult> GetFlaggedMessages([FromQuery] int threshold = 3)
        {
            var flagged = await _context.CommunityMessages
                .AsNoTracking()
                .Where(m =>
                    !m.IsSystemDeleted &&                      // exclude tombstoned messages
                    (m.IsAutoFlagged || m.ReportCount >= threshold))
                .OrderByDescending(m => m.IsAutoFlagged)       // auto-flagged first
                .ThenByDescending(m => m.ReportCount)
                .Select(m => new
                {
                    m.Id,
                    m.ChannelId,
                    m.UserId,
                    SenderName    = m.User != null ? m.User.FullName : "Unknown",
                    m.MessageText,
                    m.SentAt,
                    m.IsReported,
                    m.ReportCount,
                    m.ReportReason,
                    m.IsAutoFlagged,
                    m.IsSystemDeleted
                })
                .ToListAsync();

            return Ok(flagged);
        }

        // ── POST /api/moderation/scan ─────────────────────────────────────────

        /// <summary>
        /// Scans a raw message string through the two-tier moderation pipeline
        /// and returns the recommended action without persisting anything.
        /// Useful for client-side pre-validation or testing the keyword lists.
        /// </summary>
        [HttpPost("scan")]
        [SwaggerOperation(
            Summary     = "Dry-run the moderation pipeline on a message string",
            Description = "Returns ModerationAction (Allow / FlagForReview / TombstoneDelete) and the matched keyword (if any).",
            OperationId = "Moderation_Scan",
            Tags        = new[] { "Moderation" }
        )]
        [ProducesResponseType(StatusCodes.Status200OK)]
        public IActionResult Scan([FromBody] string messageText)
        {
            var action = _moderation.Classify(messageText);
            var detail = _moderation.GetMatchDetail(messageText);

            return Ok(new
            {
                action          = action.ToString(),
                matchedKeyword  = detail?.keyword,
                tombstoneText   = action == ModerationAction.TombstoneDelete
                                  ? ModerationConstants.TombstoneText
                                  : null
            });
        }

        // ── PUT /api/moderation/messages/{id}/dismiss ─────────────────────────

        /// <summary>
        /// Dismisses a false-alarm: resets ReportCount = 0, IsReported = false,
        /// IsAutoFlagged = false. The original message text is NOT modified.
        /// The message remains visible in its channel.
        /// </summary>
        [HttpPut("messages/{id}/dismiss")]
        [SwaggerOperation(
            Summary     = "Dismiss a reported/flagged message as a false alarm",
            OperationId = "Moderation_DismissMessage",
            Tags        = new[] { "Moderation" }
        )]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> DismissMessage(long id)
        {
            var message = await _context.CommunityMessages.FindAsync(id);
            if (message is null)
                return NotFound(new { error = $"Message {id} not found." });

            message.ReportCount   = 0;
            message.IsReported    = false;
            message.IsAutoFlagged = false;
            // ReportReason is preserved for audit trail.

            await _context.SaveChangesAsync();

            return Ok(new
            {
                messageId = message.Id,
                dismissed = true,
                message   = $"Message {id} cleared — all moderation flags reset."
            });
        }

        // ── DELETE /api/moderation/messages/{id} ──────────────────────────────

        /// <summary>
        /// Admin hard-delete of a community message.
        /// Bypasses ownership check — any admin can remove any message.
        /// </summary>
        [HttpDelete("messages/{id}")]
        [SwaggerOperation(
            Summary     = "Admin hard-delete of a community message",
            OperationId = "Moderation_DeleteMessage",
            Tags        = new[] { "Moderation" }
        )]
        [ProducesResponseType(StatusCodes.Status204NoContent)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> AdminDeleteMessage(long id)
        {
            var message = await _context.CommunityMessages.FindAsync(id);
            if (message is null)
                return NotFound(new { error = $"Message {id} not found." });

            _context.CommunityMessages.Remove(message);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        // ═══════════════════════════════════════════════════════════════════════
        // AI LOST & FOUND DISPUTE MANAGEMENT
        // ═══════════════════════════════════════════════════════════════════════

        // ── GET /api/moderation/ai-disputes ───────────────────────────────────

        /// <summary>
        /// Returns ONLY "Disputed" AI match cases — those where IsDisputed == true,
        /// meaning the Finder and Owner gave conflicting responses to the AI suggestion.
        /// These cases cannot be auto-resolved and require admin adjudication.
        ///
        /// REQUIRES MIGRATION: Add-Migration AddLostFoundDisputeTracking
        /// </summary>
        [HttpGet("ai-disputes")]
        [SwaggerOperation(
            Summary     = "Get disputed AI match cases requiring admin resolution",
            Description = "Returns LostFoundReports where IsDisputed == true AND ResolvedAt == null, ordered by creation date descending.",
            OperationId = "Moderation_GetAiDisputes",
            Tags        = new[] { "Moderation - AI" }
        )]
        [ProducesResponseType(StatusCodes.Status200OK)]
        public async Task<IActionResult> GetAiDisputes()
        {
            var disputes = await _context.LostFoundReports
                .AsNoTracking()
                .Where(r => r.IsDisputed && r.ResolvedAt == null)
                .OrderByDescending(r => r.CreatedAt)
                .Select(r => new
                {
                    r.Id,
                    r.Type,
                    r.Title,
                    r.Species,
                    r.Location,
                    r.ImageUrl,
                    r.CreatedAt,
                    r.IsDisputed,
                    r.FinderUserId,
                    r.OwnerUserId,
                    r.AdminNote,
                    r.ResolvedAt
                })
                .ToListAsync();

            return Ok(disputes);
        }

        // ── PUT /api/moderation/ai-disputes/{id}/resolve ──────────────────────

        /// <summary>
        /// Marks a disputed AI match case as resolved.
        /// Sets ResolvedAt = UTC now and optionally records an AdminNote.
        /// </summary>
        [HttpPut("ai-disputes/{id}/resolve")]
        [SwaggerOperation(
            Summary     = "Resolve a disputed AI match case",
            OperationId = "Moderation_ResolveDispute",
            Tags        = new[] { "Moderation - AI" }
        )]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> ResolveDispute(int id, [FromBody] string? adminNote = null)
        {
            var report = await _context.LostFoundReports.FindAsync(id);
            if (report is null)
                return NotFound(new { error = $"LostFoundReport {id} not found." });

            report.ResolvedAt = DateTime.UtcNow;
            if (!string.IsNullOrWhiteSpace(adminNote))
                report.AdminNote = adminNote;

            await _context.SaveChangesAsync();

            return Ok(new
            {
                reportId   = report.Id,
                resolvedAt = report.ResolvedAt,
                adminNote  = report.AdminNote,
                message    = $"Dispute for report {id} marked as resolved."
            });
        }

        // ── PUT /api/moderation/ai-disputes/{id}/dismiss ──────────────────────

        /// <summary>
        /// Dismisses a dispute without resolving it (e.g. insufficient evidence).
        /// Sets IsDisputed = false and ResolvedAt = UTC now.
        /// </summary>
        [HttpPut("ai-disputes/{id}/dismiss")]
        [SwaggerOperation(
            Summary     = "Dismiss a disputed AI match case (insufficient evidence)",
            OperationId = "Moderation_DismissDispute",
            Tags        = new[] { "Moderation - AI" }
        )]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> DismissDispute(int id)
        {
            var report = await _context.LostFoundReports.FindAsync(id);
            if (report is null)
                return NotFound(new { error = $"LostFoundReport {id} not found." });

            report.IsDisputed  = false;
            report.ResolvedAt  = DateTime.UtcNow;
            report.AdminNote ??= "Dismissed by admin — insufficient evidence.";

            await _context.SaveChangesAsync();

            return Ok(new
            {
                reportId  = report.Id,
                dismissed = true,
                message   = $"Dispute for report {id} dismissed."
            });
        }
    }
}
