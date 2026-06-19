using Petsociety.DTOs.AdoptionRequests;
using Petsociety.Model;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using System;
using System.Linq;

namespace Petsociety.Controllers
{
    [AllowAnonymous]
    [Route("api/[controller]")]
    [ApiController]
    public class AdoptionRequestsController : ControllerBase
    {
        private PetDbContext _dbContext;
        public AdoptionRequestsController(PetDbContext dbContext)
        {
            _dbContext = dbContext;
        }

        [Authorize(Roles = "Admin")]
        [HttpGet("GetAll")]
        public IActionResult GetAll([FromQuery] FilterAdoptionRequestsDto filterDto)
        {
            try
            {
                var data = from req in _dbContext.AdoptionRequests
                           from pet in _dbContext.Pets.Where(x => x.Id == req.PetId).DefaultIfEmpty()
                           from user in _dbContext.Users.Where(x => x.Id == req.UserId).DefaultIfEmpty()
                           where (filterDto.PetId == null || req.PetId == filterDto.PetId) &&
                                 (filterDto.Status == null || filterDto.Status == "All" || req.Status.ToLower() == filterDto.Status!.ToLower())
                           select new AdoptionRequestDto
                           {
                               Id = req.Id,
                               PetId = req.PetId,
                               PetBreed = pet != null ? pet.Breed : string.Empty,
                               PhoneNumber = req.PhoneNumber,
                               DeliveryMethod = req.DeliveryMethod,
                               RequesterEmail = user != null ? user.Email : string.Empty,
                               RequesterName = user != null ? user.FullName : string.Empty,
                               Status = req.Status,
                               CreatedAt = req.CreatedAt,
                               Governorate = req.Governorate
                           };

                return Ok(data.ToList());
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [HttpGet("GetById")]
        public IActionResult GetById([FromQuery] long Id)
        {
            try
            {
                var item = (from req in _dbContext.AdoptionRequests
                            join pet in _dbContext.Pets
                            on req.PetId equals pet.Id into petGroup
                            from pet in petGroup.DefaultIfEmpty()
                            from user in _dbContext.Users.Where(x => x.Id == req.UserId).DefaultIfEmpty()
                            where req.Id == Id
                            select new AdoptionRequestDto
                            {
                                Id = req.Id,
                                PetId = req.PetId,
                                PetBreed = pet != null ? pet.Breed : string.Empty,
                                PhoneNumber = req.PhoneNumber,
                                DeliveryMethod = req.DeliveryMethod,
                                RequesterEmail = user != null ? user.Email : string.Empty,
                                RequesterName = user != null ? user.FullName : string.Empty,
                                Status = req.Status,
                                CreatedAt = req.CreatedAt,
                                Governorate = req.Governorate
                            }).FirstOrDefault();

                return Ok(item);
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [Authorize]
        [HttpPost("Add")]
        public IActionResult Add([FromBody] SaveAdoptionRequestDto dto)
        {
            try
            {
                var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

                if (string.IsNullOrEmpty(userIdClaim))
                {
                    return Unauthorized();
                }

                long userId = long.Parse(userIdClaim);

                var pet = _dbContext.Pets.FirstOrDefault(x => x.Id == dto.PetId);

                if (pet == null)
                {
                    return BadRequest("Pet Does Not Exist");
                }

                if (!pet.IsAvailable)
                {
                    return BadRequest("Pet Is Not Available For Adoption");
                }

                var request = new AdoptionRequest
                {
                    Id = 0,
                    PetId = dto.PetId,
                    UserId = userId,
                    PhoneNumber = dto.PhoneNumber,
                    DeliveryMethod = dto.DeliveryMethod,
                    Governorate = dto.Governorate,
                    Status = dto.Status ?? "Pending",
                    CreatedAt = DateTime.UtcNow
                };

                _dbContext.AdoptionRequests.Add(request);
                _dbContext.SaveChanges();

                return Ok(new
                {
                    Message = "Adoption request submitted successfully"
                });
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [Authorize(Roles = "Admin")]
        [HttpPut("Update")]
        public IActionResult Update([FromBody] SaveAdoptionRequestDto dto)
        {
            try
            {
                var request = _dbContext.AdoptionRequests.FirstOrDefault(x => x.Id == dto.Id);
                if (request == null)
                {
                    return BadRequest("Adoption Request Does Not Exist");
                }

                request.PhoneNumber = dto.PhoneNumber;
                request.DeliveryMethod = dto.DeliveryMethod;
                request.Governorate = dto.Governorate;
                if (!string.IsNullOrEmpty(dto.Status))
                {
                    request.Status = dto.Status;
                }

                _dbContext.SaveChanges();
                return Ok();
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [Authorize(Roles = "Admin")]
        [HttpDelete("Delete")]
        public IActionResult Delete([FromQuery] long Id)
        {
            try
            {
                var request = _dbContext.AdoptionRequests.FirstOrDefault(x => x.Id == Id);
                if (request == null)
                {
                    return BadRequest("Adoption Request Does Not Exist");
                }
                _dbContext.AdoptionRequests.Remove(request);
                _dbContext.SaveChanges();
                return Ok();
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [HttpPut("UpdateStatus")]
        public IActionResult UpdateStatus(long id, string status)
        {
            var pet = _dbContext.Pets.Find(id);
            if (pet == null) return NotFound();

            pet.Status = status;
            pet.IsAvailable = status != "Adopted";

            _dbContext.SaveChanges();
            return Ok();
        }

        [Authorize] 
        [HttpGet("GetPetsWithUserStatus")]
        public IActionResult GetPetsWithUserStatus()
        {
            try
            {
                var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (string.IsNullOrEmpty(userIdClaim))
                {
                    return Unauthorized();
                }
                long currentUserId = long.Parse(userIdClaim);

                var result = (from pet in _dbContext.Pets
                              join req in _dbContext.AdoptionRequests.Where(r => r.UserId == currentUserId)
                              on pet.Id equals req.PetId into reqGroup
                              from userRequest in reqGroup.DefaultIfEmpty()
                              select new
                              {
                                  Id = pet.Id,
                                  Breed = pet.Breed,
                                  Type = pet.Type,
                                  AgeYears = pet.AgeYears,
                                  Gender = pet.Gender,
                                  Image = pet.ImageUrl,
                                  Tags = pet.Tags, 
                                  IsAvailable = pet.IsAvailable,
                                  UserId = pet.UserId, 

                                  IsOwner = pet.UserId == currentUserId,
                                  HasApplied = userRequest != null,
                                  AdoptionStatus = userRequest != null ? userRequest.Status : "None"
                              }).ToList();

                return Ok(result);
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

    }
}