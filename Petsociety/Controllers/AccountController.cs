using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Petsociety.DTOs.Account;
using Petsociety.Model;
using Petsociety.Models;
using System.Security.Claims;

namespace Petsociety.Controllers
{
    [Authorize] // 1. تم إعادة تفعيل الحماية هنا لحماية الـ Controller بالكامل
    [Route("api/[controller]")]
    [ApiController]
    public class AccountController : ControllerBase
    {
        private readonly PetDbContext _dbContext;

        public AccountController(PetDbContext dbContext)
        {
            _dbContext = dbContext;
        }

        // 2. إرجاع الدالة لتقرأ الـ User ID الحقيقي والـ Claims من الـ Token بشكل ديناميكي
        private int GetUserId()
        {
            return int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);
        }
        [HttpGet("dashboard")]
        public IActionResult GetDashboard()
        {
            int userId = GetUserId();

            var user = _dbContext.Users.FirstOrDefault(x => x.Id == userId);

            if (user == null)
                return NotFound();

            // 1. جلب الحيوانات الأليفة المتبناة (كودك الحالي الفعال)
            var adoptedPets = (
                from req in _dbContext.AdoptionRequests
                join pet in _dbContext.Pets
                    on req.PetId equals pet.Id
                where req.UserId == userId
                   && req.Status == "Approved"
                select new AdoptedPetDto
                {
                    Id = pet.Id,
                    Name = pet.Breed,
                    Breed = pet.Breed,
                    Type = pet.Type,
                    Gender = pet.Gender,
                    Age = pet.AgeYears.ToString(),
                    Thumbnail = pet.ImageUrl,
                    Status = pet.Status,
                    RequestStatus = req.Status
                }
            ).ToList();

            // 2. 🔥 جلب كل الاشتراكات الفعالة الحقيقية للمستخدم دون استثناء
            var userSubscriptions = _dbContext.Subscriptions
                .Where(s => s.UserId == userId && s.IsActive)
                .Select(s => new SubscriptionDto
                {
                    Id = s.Id.ToString(),
                    PlanName = s.PackageName,
                    Price = s.Price,
                    // 🌟 الحل الجذري: استخدمنا الـ Pipe '|' للفصل ليتوافق تماماً مع معالجة الفرونت آند وتظهر ميزات كل كرت على حدة
                    Features = s.PackageName.ToLower() == "premium"
                               ? "Premium Care Package | Monthly Toys & Treats | 24/7 Vet Support"
                               : "Basic Care Package | Monthly Treats"
                })
                .ToList();

            // 3. بناء لوحة التحكم وضمان تمرير المصفوفة كاملة
            var dashboard = new DashboardDto
            {
                User = new UserProfileDto
                {
                    Name = user.FullName,
                    Email = user.Email,
                    MemberSince = "Member since recently",
                    AvatarInitial = !string.IsNullOrEmpty(user.FullName) ? user.FullName.Substring(0, 1).ToUpper() : "U"
                },

                Stats = new AccountStatsDto
                {
                    SubscriptionsCount = userSubscriptions.Count, // تحديث العداد ديناميكياً من حجم المصفوفة الحقيقي
                    AdoptedCount = adoptedPets.Count
                },

                Subscriptions = userSubscriptions, // تمرير القائمة كاملة لعرض الكروت المتعددة
                AdoptedPets = adoptedPets
            };

            return Ok(dashboard);
        }

        // POST: api/Account/Logout
        [HttpPost("Logout")]
        public IActionResult Logout()
        {
            try
            {
                return Ok(new
                {
                    message = "Logged out successfully"
                });
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }
    }
}