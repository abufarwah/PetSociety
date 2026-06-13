//using Microsoft.AspNetCore.Mvc;
//using Petsociety.DTOs.SubscriptionDTOs;
//using Microsoft.AspNetCore.Authorization;
//using System.Security.Claims;
//using Microsoft.EntityFrameworkCore;
//using Petsociety.Model;
//using Petsociety.Models;

//namespace Petsociety.Controllers
//{
//    //[Authorize]
//    [Route("api/[controller]")]
//    [ApiController]
//    public class SubscriptionController : ControllerBase
//    {
//        private readonly PetDbContext _context;

//        public SubscriptionController(PetDbContext context)
//        {
//            _context = context;
//        }

//        [Authorize]
//        [HttpPost("process-payment")]
//        //public IActionResult ProcessPayment([FromBody] PaymentRequestDTO request)
//        public async Task<IActionResult> ProcessPayment([FromBody] PaymentRequestDTO request)
//        {
//            if (!ModelState.IsValid)
//                return BadRequest(ModelState);

//            //var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);

//            //if (userIdClaim == null)
//            //{
//            //    return Unauthorized();
//            //}

//            //int userId = int.Parse(userIdClaim.Value);

//            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);

//            decimal actualPrice = request.PackageName?.ToLower() switch
//            {
//                "basic" => 9m,
//                "premium" => 19m,
//                "deluxe" => 29m,
//                _ => 0m
//            };

//            if (actualPrice == 0)
//            {
//                return BadRequest("Invalid package selected.");
//            }

//            var existingSubscription = await _context.Subscriptions
//           .FirstOrDefaultAsync(s => s.UserId == userId && s.IsActive);

//            if (existingSubscription != null)
//            {
//                return BadRequest("You already have an active subscription.");
//            }

//            decimal tax = actualPrice * 0.11m;
//            decimal total = actualPrice + tax;

//            var newSubscription = new Subscription
//            {
//                //UserId = 1, 
//                UserId = userId,
//                PackageName = request.PackageName,
//                Price = actualPrice,
//                StartDate = DateTime.UtcNow,
//                EndDate = DateTime.UtcNow.AddMonths(1),
//                IsActive = true
//            };

//            _context.Subscriptions.Add(newSubscription);
//            //_context.SaveChanges();
//            await _context.SaveChangesAsync();

//            var payment = new Payment
//            {
//                UserId = userId,
//                SubscriptionId = newSubscription.Id,
//                Amount = total,
//                PaymentDate = DateTime.UtcNow
//            };

//            _context.Payments.Add(payment);

//            await _context.SaveChangesAsync();

//            return Ok(new { success = true, message = "Payment successful! Subscription activated." });
//        }

//        // ── PUT /api/subscription/subscriptions/{id}/manage ───────────────────
//        // Admin endpoint: toggle a subscription's active/cancelled status.
//        // Does NOT require the caller to be the subscription owner.

//        /// <summary>
//        /// Toggles a subscription's IsActive status (Active ↔ Cancelled).
//        /// Intended for admin use from the dashboard.
//        /// </summary>
//        /// <response code="200">Status toggled successfully.</response>
//        /// <response code="404">Subscription not found.</response>
//        //[AllowAnonymous] // TODO [TEAM INTEGRATION]: Replace with [Authorize(Roles = "Admin")] once role claims are set up.

//        [Authorize(Roles = "Admin")]
//        [HttpPut("subscriptions/{id}/manage")]
//        public async Task<IActionResult> ManageSubscription(int id)
//        {
//            var subscription = await _context.Subscriptions.FindAsync(id);
//            if (subscription is null)
//                return NotFound(new { error = $"Subscription with id {id} not found." });

//            // Toggle: Active → Cancelled, Cancelled → Active
//            subscription.IsActive = !subscription.IsActive;
//            await _context.SaveChangesAsync();

//            return Ok(new
//            {
//                subscriptionId = subscription.Id,
//                isActive       = subscription.IsActive,
//                newStatus      = subscription.IsActive ? "Active" : "Cancelled",
//                message        = $"Subscription {id} is now {(subscription.IsActive ? "Active" : "Cancelled")}."
//            });
//        }
//    }
//}



using Microsoft.AspNetCore.Mvc;
using Petsociety.DTOs.SubscriptionDTOs;
using Microsoft.AspNetCore.Authorization;
using System.Security.Claims;
using Microsoft.EntityFrameworkCore;
using Petsociety.Model;
using Petsociety.Models;

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

        [Authorize]
        [HttpPost("process-payment")]
        public async Task<IActionResult> ProcessPayment([FromBody] PaymentRequestDTO request)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            // 1. جلب الـ UserId بأمان لضمان عدم حدوث NullReferenceException
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
            if (userIdClaim == null)
            {
                return Unauthorized(new { message = "User identification failed. Please log in again." });
            }
            int userId = int.Parse(userIdClaim.Value);

            // 2. التحقق من اسم الباقة الممررة
            decimal actualPrice = request.PackageName?.ToLower() switch
            {
                "basic" => 9m,
                "premium" => 19m,
                "deluxe" => 29m,
                _ => 0m
            };

            if (actualPrice == 0)
            {
                return BadRequest(new { message = "Invalid package selected." });
            }

            // 3. 💡 تعديل ذكي للتطوير والبيئة التجريبية (Development):
            // نقوم بإلغاء تفعيل أي اشتراك فعال قديم تلقائياً ليتمكن نفس المستخدم من تجربة الدفع بنجاح دائماً دون تعليق
            var existingSubscriptions = await _context.Subscriptions
                .Where(s => s.UserId == userId && s.IsActive)
                .ToListAsync();

            if (existingSubscriptions.Any())
            {
                foreach (var oldSub in existingSubscriptions)
                {
                    oldSub.IsActive = false; // تحويله لغير فعال لإتاحة المجال للاشتراك الجديد
                }
                await _context.SaveChangesAsync();
            }

            // 4. حساب الضرائب والمجموع الإجمالي
            decimal tax = actualPrice * 0.11m;
            decimal total = actualPrice + tax;

            // 5. إنشاء سجل الاشتراك الجديد
            var newSubscription = new Subscription
            {
                UserId = userId,
                PackageName = request.PackageName,
                Price = actualPrice,
                StartDate = DateTime.UtcNow,
                EndDate = DateTime.UtcNow.AddMonths(1),
                IsActive = true
            };

            _context.Subscriptions.Add(newSubscription);
            await _context.SaveChangesAsync();

            // 6. إنشاء سجل الدفع المالي وتثبيته في قاعدة البيانات
            var payment = new Payment
            {
                UserId = userId,
                SubscriptionId = newSubscription.Id,
                Amount = total,
                PaymentDate = DateTime.UtcNow
            };

            _context.Payments.Add(payment);
            await _context.SaveChangesAsync();

            // 7. إرجاع كائن JSON صريح يتطابق تماماً مع ما ينتظره الأنجولار
            return Ok(new { success = true, message = $"Payment successful! Your {request.PackageName} subscription is now activated." });
        }

        /// <summary>
        /// لوحة تحكم الإدارة: لتغيير حالة اشتراك معين بين فعال وملغي
        /// </summary>
        [Authorize(Roles = "Admin")]
        [HttpPut("subscriptions/{id}/manage")]
        public async Task<IActionResult> ManageSubscription(int id)
        {
            var subscription = await _context.Subscriptions.FindAsync(id);
            if (subscription is null)
                return NotFound(new { error = $"Subscription with id {id} not found." });

            // تبديل الحالة: Active ↔ Cancelled
            subscription.IsActive = !subscription.IsActive;
            await _context.SaveChangesAsync();

            return Ok(new
            {
                subscriptionId = subscription.Id,
                isActive = subscription.IsActive,
                newStatus = subscription.IsActive ? "Active" : "Cancelled",
                message = $"Subscription {id} is now {(subscription.IsActive ? "Active" : "Cancelled")}."
            });
        }
    }
}