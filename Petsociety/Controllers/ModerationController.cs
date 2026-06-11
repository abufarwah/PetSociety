using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Petsociety.Model;
using Petsociety.Services;
using Swashbuckle.AspNetCore.Annotations;

namespace Petsociety.Controllers
{
    /// <summary>
    /// Admin-only moderation endpoints for community messages.
    ///
    /// MIGRATION REQUIRED before these endpoints return live data:
    ///   Add-Migration AddMessageModerationV2
    ///   Update-Database
    /// </summary>

    [Authorize(Roles = "Admin")]
    [Route("api/moderation")]
    [ApiController]
    public class ModerationController : ControllerBase
    {
        private readonly PetDbContext _context;
        private readonly IMessageModerationService _moderation;

        public ModerationController(PetDbContext context, IMessageModerationService moderation)
        {
            _context    = context;
            _moderation = moderation;
        }

        // ── GET /api/moderation/flagged-messages ──────────────────────────────

        /// <summary>
        /// Returns messages that require admin review.
        ///
        /// Filter logic (hierarchical threshold architecture):
        ///   • IsSystemDeleted == false  — Tombstoned messages never appear in the queue.
        ///   • AND (IsAutoFlagged == true OR ReportCount >= threshold)
        ///     — Only messages that a human or the AI flagged surface here.
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
                    !m.IsSystemDeleted &&
                    (m.IsAutoFlagged || m.ReportCount >= threshold))
                .OrderByDescending(m => m.IsAutoFlagged)
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
        /// Dry-run: scans a raw message string through the two-tier moderation pipeline
        /// and returns the recommended action without persisting anything.
        /// Useful for testing the keyword lists.
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
                action         = action.ToString(),
                matchedKeyword = detail?.keyword,
                tombstoneText  = action == ModerationAction.TombstoneDelete
                                 ? ModerationConstants.TombstoneText
                                 : null
            });
        }

        // ── PUT /api/moderation/messages/{id}/dismiss ─────────────────────────

        /// <summary>
        /// Dismisses a false-alarm: resets ReportCount = 0, IsReported = false,
        /// IsAutoFlagged = false. The original message text is NOT modified.
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
    }
}
