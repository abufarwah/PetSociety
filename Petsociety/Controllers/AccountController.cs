using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Petsociety.DTOs.Account;
using Petsociety.Model;
using System.Security.Claims;

namespace Petsociety.Controllers
{
    [Authorize]
    [Route("api/[controller]")]
    [ApiController]
    public class AccountController : ControllerBase
    {
        private readonly PetDbContext _dbContext;

        public AccountController(PetDbContext dbContext)
        {
            _dbContext = dbContext;
        }

        // GET: api/Account/Dashboard
        [HttpGet("Dashboard")]
        public IActionResult GetDashboard()
        {
            try
            {
                var email = User.Claims
                    .FirstOrDefault(c => c.Type == ClaimTypes.Email)?.Value;

                if (string.IsNullOrEmpty(email))
                    return Unauthorized();

                var user = _dbContext.Users
                    .FirstOrDefault(u => u.Email == email);

                if (user == null)
                    return NotFound("User not found");

                // User Profile
                var profile = new UserProfileDto
                {
                    Name = user.FullName,
                    Email = user.Email,
                    MemberSince = "Unknown",
                    AvatarInitial = string.IsNullOrWhiteSpace(user.FullName)
                        ? "U"
                        : user.FullName[0].ToString().ToUpper()
                };

                // User Adopted Pets
                var adoptedPets = (
                    from req in _dbContext.AdoptionRequests
                    join pet in _dbContext.Pets
                    on req.PetId equals pet.Id
                    where req.UserId == user.Id &&
                          req.Status.ToLower() == "approved"
                    select new AdoptedPetDto
                    {
                        Id = pet.Id,
                        Name = pet.Breed,
                        Thumbnail = pet.ImageUrl,
                        Status = req.Status
                    }
                ).ToList();

                // Stats
                var stats = new AccountStatsDto
                {
                    SubscriptionsCount = 0,
                    AdoptedCount = adoptedPets.Count
                };

                // Final Dashboard Response
                var dashboard = new DashboardDto
                {
                    User = profile,
                    Stats = stats,
                    AdoptedPets = adoptedPets
                };

                return Ok(dashboard);
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
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