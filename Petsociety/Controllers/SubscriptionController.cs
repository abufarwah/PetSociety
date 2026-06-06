using Microsoft.AspNetCore.Mvc;
using Petsociety.DTOs.SubscriptionDTOs;
using Microsoft.AspNetCore.Authorization;
using System.Security.Claims;
using Microsoft.EntityFrameworkCore;
using Petsociety.Model;
using Petsociety.Models;

namespace Petsociety.Controllers
{
    [Authorize]
    [Route("api/[controller]")]
    [ApiController]
    public class SubscriptionController : ControllerBase
    {
        private readonly PetDbContext _context;

        public SubscriptionController(PetDbContext context)
        {
            _context = context;
        }

        [HttpPost("process-payment")]
        //public IActionResult ProcessPayment([FromBody] PaymentRequestDTO request)
        public async Task<IActionResult> ProcessPayment([FromBody] PaymentRequestDTO request)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);

            if (userIdClaim == null)
            {
                return Unauthorized();
            }

            int userId = int.Parse(userIdClaim.Value);


            decimal actualPrice = request.PackageName?.ToLower() switch
            {
                "basic" => 9m,
                "premium" => 19m,
                "deluxe" => 29m,
                _ => 0m
            };

            if (actualPrice == 0)
            {
                return BadRequest("Invalid package selected.");
            }

            var existingSubscription = await _context.Subscriptions
           .FirstOrDefaultAsync(s => s.UserId == userId && s.IsActive);

            if (existingSubscription != null)
            {
                return BadRequest("You already have an active subscription.");
            }

            decimal tax = actualPrice * 0.11m;
            decimal total = actualPrice + tax;

            var newSubscription = new Subscription
            {
                //UserId = 1, 
                UserId = userId,
                PackageName = request.PackageName,
                Price = actualPrice,
                StartDate = DateTime.UtcNow,
                EndDate = DateTime.UtcNow.AddMonths(1),
                IsActive = true
            };

            _context.Subscriptions.Add(newSubscription);
            //_context.SaveChanges();
            await _context.SaveChangesAsync();

            var payment = new Payment
            {
                UserId = userId,
                SubscriptionId = newSubscription.Id,
                Amount = total,
                PaymentDate = DateTime.UtcNow
            };

            _context.Payments.Add(payment);

            await _context.SaveChangesAsync();

            return Ok(new { success = true, message = "Payment successful! Subscription activated." });
        }

        // ── PUT /api/subscription/subscriptions/{id}/manage ───────────────────
        // Admin endpoint: toggle a subscription's active/cancelled status.
        // Does NOT require the caller to be the subscription owner.

        /// <summary>
        /// Toggles a subscription's IsActive status (Active ↔ Cancelled).
        /// Intended for admin use from the dashboard.
        /// </summary>
        /// <response code="200">Status toggled successfully.</response>
        /// <response code="404">Subscription not found.</response>
        [AllowAnonymous] // TODO [TEAM INTEGRATION]: Replace with [Authorize(Roles = "Admin")] once role claims are set up.
        [HttpPut("subscriptions/{id}/manage")]
        public async Task<IActionResult> ManageSubscription(int id)
        {
            var subscription = await _context.Subscriptions.FindAsync(id);
            if (subscription is null)
                return NotFound(new { error = $"Subscription with id {id} not found." });

            // Toggle: Active → Cancelled, Cancelled → Active
            subscription.IsActive = !subscription.IsActive;
            await _context.SaveChangesAsync();

            return Ok(new
            {
                subscriptionId = subscription.Id,
                isActive       = subscription.IsActive,
                newStatus      = subscription.IsActive ? "Active" : "Cancelled",
                message        = $"Subscription {id} is now {(subscription.IsActive ? "Active" : "Cancelled")}."
            });
        }
    }
}