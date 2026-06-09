using Petsociety.DTOs.Pets;
using Petsociety.Model;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Hosting;
using System;
using System.Linq;
using System.IO;

namespace Petsociety.Controllers
{
    [AllowAnonymous]
    [Route("api/[controller]")]
    [ApiController]
    public class PetsController : ControllerBase
    {
        private PetDbContext _dbContext;
        private readonly IWebHostEnvironment _env;

        public PetsController(PetDbContext dbContext, IWebHostEnvironment env)
        {
            _dbContext = dbContext;
            _env = env;
        }

        [HttpGet("GetAll")]
        public IActionResult GetAll([FromQuery] FilterPetsDto filterDto)
        {
            try
            {
                // Materialize the query first to avoid expression tree issues with .Split and .ToList
                var baseUrl = $"{Request.Scheme}://{Request.Host}";

                var data = _dbContext.Pets
                    .Where(pet =>
                        (filterDto.Breed == null || pet.Breed.Contains(filterDto.Breed)) &&  //*******
                        (filterDto.Type == null || filterDto.Type == "All" || pet.Type.ToUpper() == filterDto.Type.ToUpper()) &&
                        (filterDto.AgeCategory == null || filterDto.AgeCategory == "All" || pet.AgeCategory.ToUpper() == filterDto.AgeCategory.ToUpper()) &&
                        (filterDto.Gender == null || filterDto.Gender == "All" || pet.Gender.ToUpper() == filterDto.Gender.ToUpper()) &&
                        (filterDto.Tag == null || filterDto.Tag == "All" || pet.Tags.ToUpper().Contains(filterDto.Tag.ToUpper()))
                    )
                    .ToList() // Materialize here
                    .Select(pet => new PetDto
                    {
                        Id = pet.Id,
                        Breed = pet.Breed,
                        Type = pet.Type,
                        AgeCategory = pet.AgeCategory,
                        AgeYears = pet.AgeYears,
                        Gender = pet.Gender,
                        ImageUrl = string.IsNullOrWhiteSpace(pet.ImageUrl)
                            ? baseUrl + "/images/default-pet.png"
                            : pet.ImageUrl.StartsWith("/")
                                ? baseUrl + pet.ImageUrl
                                : pet.ImageUrl,
                        Tags = pet.Tags == null
                            ? new System.Collections.Generic.List<string>()
                            : pet.Tags.Split(',').Select(t => t.Trim()).Where(t => t != string.Empty).ToList(),
                        Description = pet.Description,
                        IsAvailable = pet.IsAvailable
                    });

                return Ok(data);
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
                // Materialize the query first, then project to DTO to avoid expression tree issues
                var petEntity = _dbContext.Pets.FirstOrDefault(x => x.Id == Id);

                if (petEntity == null)
                    return Ok(null);

                var baseUrl = $"{Request.Scheme}://{Request.Host}";

                var pet = new PetDto
                {
                    Id = petEntity.Id,
                    Breed = petEntity.Breed,
                    Type = petEntity.Type,
                    AgeCategory = petEntity.AgeCategory,
                    AgeYears = petEntity.AgeYears,
                    Gender = petEntity.Gender,
                    ImageUrl = string.IsNullOrWhiteSpace(petEntity.ImageUrl)
                        ? baseUrl + "/images/default-pet.png"
                        : petEntity.ImageUrl.StartsWith("/")
                            ? baseUrl + petEntity.ImageUrl
                            : petEntity.ImageUrl,
                    Tags = petEntity.Tags == null
                        ? new System.Collections.Generic.List<string>()
                        : petEntity.Tags.Split(',').Select(t => t.Trim()).Where(t => t != string.Empty).ToList(),
                    Description = petEntity.Description,
                    IsAvailable = petEntity.IsAvailable
                };

                return Ok(pet);
            }

            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [HttpPost("Add")]
        public IActionResult Add([FromForm] SavePetDto petDto)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(petDto.Breed))
                    return BadRequest("Breed is required");

                // Image is optional; only save if provided

                var pet = new Pet
                {
                    Breed = petDto.Breed,
                    Type = petDto.Type,
                    AgeCategory = petDto.AgeCategory,
                    AgeYears = petDto.AgeYears,
                    Gender = petDto.Gender,
                    Tags = petDto.Tags != null
                        ? string.Join(',', petDto.Tags.Where(t => !string.IsNullOrWhiteSpace(t)))
                        : string.Empty,
                    Description = petDto.Description,
                    IsAvailable = petDto.IsAvailable
                };

                if (petDto.Image != null)
                {
                    var uploadsFolder = Path.Combine(_env.WebRootPath ?? "wwwroot", "images");

                    if (!Directory.Exists(uploadsFolder))
                    {
                        Directory.CreateDirectory(uploadsFolder);
                    }

                    var fileName = Guid.NewGuid() + Path.GetExtension(petDto.Image.FileName);
                    var path = Path.Combine(uploadsFolder, fileName);

                    using var stream = new FileStream(path, FileMode.Create);
                    petDto.Image.CopyTo(stream);

                    pet.ImageUrl = "/images/" + fileName;
                }
                else
                {
                    // assign a default placeholder so DB non-null constraint is satisfied
                    pet.ImageUrl = "/images/default-pet.png";
                }

                _dbContext.Pets.Add(pet);
                _dbContext.SaveChanges();

                return Ok(new { id = pet.Id, imageUrl = pet.ImageUrl });
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [HttpPut("Update")]
        public IActionResult Update([FromForm] SavePetDto petDto)
        {
            try
            {
                var pet = _dbContext.Pets.FirstOrDefault(x => x.Id == petDto.Id);

                if (pet == null)
                    return BadRequest("Pet Does Not Exist");

                if (string.IsNullOrWhiteSpace(petDto.Breed))
                    return BadRequest("Breed is required");

                pet.Breed = petDto.Breed;
                pet.Type = petDto.Type;
                pet.AgeCategory = petDto.AgeCategory;
                pet.AgeYears = petDto.AgeYears;
                pet.Gender = petDto.Gender;

                pet.Tags = petDto.Tags != null
                    ? string.Join(',', petDto.Tags.Where(t => !string.IsNullOrWhiteSpace(t)))
                    : string.Empty;

                pet.Description = petDto.Description;
                pet.IsAvailable = petDto.IsAvailable;

                if (petDto.Image != null)
                {
                    var uploadsFolder = Path.Combine(_env.WebRootPath ?? "wwwroot", "images");

                    if (!Directory.Exists(uploadsFolder))
                        Directory.CreateDirectory(uploadsFolder);

                    var fileName = Guid.NewGuid() + Path.GetExtension(petDto.Image.FileName);
                    var path = Path.Combine(uploadsFolder, fileName);

                    using var stream = new FileStream(path, FileMode.Create);
                    petDto.Image.CopyTo(stream);

                    pet.ImageUrl = "/images/" + fileName;
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
                var pet = _dbContext.Pets.FirstOrDefault(x => x.Id == Id);
                if (pet == null)
                {
                    return BadRequest("Pet Does Not Exist");
                }
                _dbContext.Pets.Remove(pet);
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