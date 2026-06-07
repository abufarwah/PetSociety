using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Petsociety.DTOs.Dashboard;
using Petsociety.Model;
using Swashbuckle.AspNetCore.Annotations;

namespace Petsociety.Controllers
{
    /// <summary>
    /// Provides aggregated KPI metrics for the Admin Dashboard.
    /// All queries are read-only (AsNoTracking) and executed asynchronously.
    /// </summary>
    [Route("api/[controller]")]
    [ApiController]
    public class DashboardController : ControllerBase
    {
        private readonly PetDbContext _context;

        public DashboardController(PetDbContext context)
        {
            _context = context;
        }

        /// <summary>Returns a single-object KPI summary for the Admin Dashboard.</summary>
        /// <remarks>
        /// All 8 database queries run concurrently via Task.WhenAll.
        /// OverallAiSuccessRate = (reports with FeatureVector / total reports) × 100.
        /// A user-confirmation-based rate requires adding LostFoundReport.UserConfirmedMatch
        /// via a new migration.
        /// </remarks>
        /// <response code="200">Dashboard KPI summary returned successfully.</response>
        /// <response code="500">An unexpected error occurred while aggregating data.</response>
        [HttpGet("summary")]
        [SwaggerOperation(
            Summary     = "Get Admin Dashboard KPI Summary",
            Description = "Returns real-time metrics for users, pets, adoptions, subscriptions, MRR, community channels, and AI report statistics including overall success rate.",
            OperationId = "Dashboard_GetSummary",
            Tags        = new[] { "Dashboard" }
        )]
        [ProducesResponseType(typeof(DashboardSummaryDto), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<ActionResult<DashboardSummaryDto>> GetSummary()
        {
            try
            {
                var totalUsersTask = _context.Users
                    .AsNoTracking().CountAsync();

                var availablePetsTask = _context.Pets
                    .AsNoTracking().CountAsync(p => p.IsAvailable);

                var pendingAdoptionsTask = _context.AdoptionRequests
                    .AsNoTracking().CountAsync(r => r.Status == "Pending");

                var activeSubscriptionsTask = _context.Subscriptions
                    .AsNoTracking().CountAsync(s => s.IsActive);

                var mrrTask = _context.Subscriptions
                    .AsNoTracking()
                    .Where(s => s.IsActive)
                    .SumAsync(s => (decimal?)s.Price);

                var totalChatChannelsTask = _context.CommunityChannels
                    .AsNoTracking().CountAsync();

                var totalAiReportsTask = _context.LostFoundReports
                    .AsNoTracking().CountAsync();

                var successfulAiMatchesTask = _context.LostFoundReports
                    .AsNoTracking()
                    .CountAsync(r => r.FeatureVector != null && r.FeatureVector != string.Empty);

                await Task.WhenAll(
                    totalUsersTask,
                    availablePetsTask,
                    pendingAdoptionsTask,
                    activeSubscriptionsTask,
                    mrrTask,
                    totalChatChannelsTask,
                    totalAiReportsTask,
                    successfulAiMatchesTask
                );

                int totalReports     = totalAiReportsTask.Result;
                int successfulMatches = successfulAiMatchesTask.Result;

                // OverallAiSuccessRate: percentage of reports that were processed by
                // the AI model (i.e., received a FeatureVector). Returns 0.0 when no
                // reports exist to avoid division-by-zero.
                double overallAiSuccessRate = totalReports > 0
                    ? Math.Round((double)successfulMatches / totalReports * 100, 1)
                    : 0.0;

                var summary = new DashboardSummaryDto
                {
                    TotalUsers               = totalUsersTask.Result,
                    AvailablePets            = availablePetsTask.Result,
                    PendingAdoptions         = pendingAdoptionsTask.Result,
                    TotalActiveSubscriptions = activeSubscriptionsTask.Result,
                    MonthlyRecurringRevenue  = mrrTask.Result ?? 0m,
                    TotalChatChannels        = totalChatChannelsTask.Result,
                    TotalAiReportsProcessed  = totalReports,
                    SuccessfulAiMatches      = successfulMatches,
                    OverallAiSuccessRate     = overallAiSuccessRate
                };

                return Ok(summary);
            }
            catch (Exception ex)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, new
                {
                    error  = "An error occurred while aggregating dashboard data.",
                    detail = ex.Message
                });
            }
        }
    }
}
