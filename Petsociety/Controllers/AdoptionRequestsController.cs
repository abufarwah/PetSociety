using Petsociety.DTOs.AdoptionRequests;
using Petsociety.Model;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
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
                               CreatedAt = req.CreatedAt
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
                                CreatedAt = req.CreatedAt
                            }).FirstOrDefault();

                return Ok(item);
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [HttpPost("Add")]
        public IActionResult Add([FromBody] SaveAdoptionRequestDto dto)
        {
            try
            {
                var pet = _dbContext.Pets.FirstOrDefault(x => x.Id == dto.PetId);
                if (pet == null)
                {
                    return BadRequest("Pet Does Not Exist");
                }

                if (!pet.IsAvailable)
                {
                    return BadRequest("Pet Is Not Available For Adoption");
                }

                long userId = 0;
                if (!string.IsNullOrWhiteSpace(dto.UserEmail))
                {
                    var normalizedEmail = dto.UserEmail.Trim().ToLower();
                    var user = _dbContext.Users.FirstOrDefault(x => x.Email.ToLower() == normalizedEmail);
                    if (user == null)
                    {
                        user = new User
                        {
                            FullName = normalizedEmail.Contains('@') ? normalizedEmail.Substring(0, normalizedEmail.IndexOf('@')) : normalizedEmail,
                            Email = normalizedEmail,
                            PasswordHash = "external-user",
                            IsActive = true,
                            IsDeleted = false,
                            IsRestricted = false
                        };
                        _dbContext.Users.Add(user);
                        _dbContext.SaveChanges();
                    }
                    userId = user.Id;
                }

                var request = new AdoptionRequest
                {
                    Id = 0,
                    PetId = dto.PetId,
                    UserId = userId,
                    PhoneNumber = dto.PhoneNumber,
                    DeliveryMethod = dto.DeliveryMethod,
                    Status = dto.Status ?? "Pending",
                    CreatedAt = DateTime.UtcNow
                };

                _dbContext.AdoptionRequests.Add(request);
                _dbContext.SaveChanges();

                // Note: not changing pet.IsAvailable here to preserve admin approval workflow

                return Ok();
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

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

                // Only allow status update and delivery/phone fields in this simple implementation
                request.PhoneNumber = dto.PhoneNumber;
                request.DeliveryMethod = dto.DeliveryMethod;
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
    }
}