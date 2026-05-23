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

       
        public SubscriptionController(   PetDbContext context)
        {
            _context = context;
        }

        [HttpPost("process-payment")]
        public IActionResult ProcessPayment([FromBody] PaymentRequestDTO request)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            
            var newSubscription = new Subscription
            {
                UserId = request.UserId,
                PackageName = request.PackageName,
                Price = request.TotalAmount,
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