using Microsoft.AspNetCore.Mvc;
using Petsociety.DTOs.SubscriptionDTOs;
using Petsociety.Model;

namespace Petsociety.Controllers
{
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
        public IActionResult ProcessPayment([FromBody] PaymentRequestDTO request)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            
            decimal actualPrice = request.PackageName?.ToLower() switch
            {
                "basic" => 9m,
                "premium" => 19m,
                "deluxe" => 29m,
                
            };

            var newSubscription = new Subscription
            {
                UserId = 1, 
                PackageName = request.PackageName,
                Price = actualPrice,
                StartDate = DateTime.UtcNow,
                EndDate = DateTime.UtcNow.AddMonths(1),
                IsActive = true
            };

            _context.Subscriptions.Add(newSubscription);
            _context.SaveChanges();

            return Ok(new { success = true, message = "Payment successful! Subscription activated." });
        }
    }
}