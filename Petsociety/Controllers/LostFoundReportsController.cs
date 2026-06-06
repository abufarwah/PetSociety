using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Petsociety.Model;
using Petsociety.DTOs.LostFound;
using Petsociety.Services;
using System;
using System.Linq;

namespace Petsociety.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class LostFoundReportsController : ControllerBase
    {
        private readonly PetDbContext _db;
        private readonly IImageStorageService _imageStorage;

        public LostFoundReportsController(PetDbContext db, IImageStorageService imageStorage)
        {
            _db = db;
            _imageStorage = imageStorage;
        }

        // Public list with filters & paging
        [HttpGet("reports")]
        public IActionResult GetReports([FromQuery] string? type, [FromQuery] string? petType,
            [FromQuery] string? status, [FromQuery] string? search, [FromQuery] int page = 1, [FromQuery] int pageSize = 12)
        {
            try
            {
                var q = _db.Set<LostFoundReport>()
           .Where(r => r.IsPublished)
           .AsQueryable();

                if (!string.IsNullOrEmpty(type) && Enum.TryParse<LostFoundReportType>(type, true, out var rtype))
                    q = q.Where(r => r.Type == rtype);

                if (!string.IsNullOrEmpty(petType))
                    q = q.Where(r => r.PetType.ToLower().Contains(petType.ToLower()));

                if (!string.IsNullOrEmpty(status) && Enum.TryParse<LostFoundReportStatus>(status, true, out var st))
                    q = q.Where(r => r.Status == st);

                if (!string.IsNullOrWhiteSpace(search))
                {
                    var s = search.ToLower();
                    q = q.Where(r =>
    (r.Breed ?? "").ToLower().Contains(s) ||
    (r.Description ?? "").ToLower().Contains(s) ||
    (r.Location ?? "").ToLower().Contains(s));
                }

                var total = q.Count();
                page = Math.Max(1, page);
                pageSize = Math.Clamp(pageSize, 1, 100);
                var items = q.OrderByDescending(r => r.CreatedAt)
                             .Skip((page - 1) * pageSize)
                             .Take(pageSize)
                             .Select(r => new LostFoundReportDto
                             {
                                 Id = r.Id,
                                 Type = r.Type.ToString().ToLower(),
                                 PetType = r.PetType,
                                 Breed = r.Breed,
                                 ColorMarkings = r.ColorMarkings,
                                 DateLastSeen = r.DateLastSeen,
                                 Location = r.Location,
                                 Excerpt = (r.Description ?? string.Empty).Length > 200 ? (r.Description ?? string.Empty).Substring(0, 200) + "..." : (r.Description ?? string.Empty),
                                 ImageUrl = r.ImageUrl,
                                 ReporterName = r.ReporterName,
                                 ReporterPhone = null, // hide phone on list
                                 Status = r.Status.ToString(),
                                 CreatedAt = r.CreatedAt
                             }).ToList();

                var resp = new LostFoundListResponseDto
                {
                    Items = items,
                    Total = total,
                    Page = page,
                    PageSize = pageSize
                };

                return Ok(resp);
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        // GET single
        [HttpGet("reports/{id:int}")]
        public IActionResult GetById(int id)
        {
            try
            {
                var r = _db.Set<LostFoundReport>()
            .FirstOrDefault(x => x.Id == id && x.IsPublished);
                if (r == null) return NotFound();

                var dto = new LostFoundReportDto
                {
                    Id = r.Id,
                    Type = r.Type.ToString().ToLower(),
                    PetType = r.PetType,
                    Breed = r.Breed,
                    ColorMarkings = r.ColorMarkings,
                    DateLastSeen = r.DateLastSeen,
                    Location = r.Location,
                    Excerpt = r.Description ?? string.Empty,
                    ImageUrl = r.ImageUrl,
                    ReporterName = r.ReporterName,
                    ReporterPhone = r.ReporterPhone, // reveal on details
                    Status = r.Status.ToString(),
                    CreatedAt = r.CreatedAt
                };

                return Ok(dto);
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        // Public create (multipart/form-data)
        [AllowAnonymous]
        [HttpPost("reports")]
        [ProducesResponseType(201)]
        public IActionResult Create([FromForm] SaveLostFoundReportDto dto)
        {
            try
            {
                // Basic validation
                if (string.IsNullOrWhiteSpace(dto.Type) || !Enum.TryParse<LostFoundReportType>(dto.Type, true, out _))
                    return BadRequest("Type must be 'lost' or 'found'.");

                if (string.IsNullOrWhiteSpace(dto.PetType))
                    return BadRequest("PetType is required.");

                if (string.IsNullOrWhiteSpace(dto.ColorMarkings))
                    return BadRequest("ColorMarkings is required.");

                if (string.IsNullOrWhiteSpace(dto.Location))
                    return BadRequest("Location is required.");

                if (string.IsNullOrWhiteSpace(dto.ReporterName) || string.IsNullOrWhiteSpace(dto.ReporterPhone))
                    return BadRequest("ReporterName and ReporterPhone are required.");

                string imageUrl = string.Empty;
                string imageFileName = string.Empty;
                if (dto.ImageFile != null)
                {
                    var saved = _imageStorage.SaveLostFoundImageAsync(dto.ImageFile).GetAwaiter().GetResult();
                    imageUrl = saved.Url;
                    imageFileName = saved.FileName;
                }

                var entity = new LostFoundReport
                {
                    Type = Enum.Parse<LostFoundReportType>(dto.Type, true),
                    PetType = dto.PetType,
                    Breed = dto.Breed ?? string.Empty,
                    ColorMarkings = dto.ColorMarkings,
                    DateLastSeen = dto.DateLastSeen == default ? DateTime.UtcNow : dto.DateLastSeen,
                    Location = dto.Location,
                    Description = dto.Description ?? string.Empty,
                    ImageUrl = imageUrl,
                    ImageFileName = imageFileName,
                    ReporterName = dto.ReporterName,
                    ReporterPhone = dto.ReporterPhone,
                    ReporterUserId = null,
                    Status = LostFoundReportStatus.Open,
                    IsPublished = true,
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow
                };

                _db.LostFoundReports.Add(entity);
                _db.SaveChanges();

                var result = new LostFoundReportDto
                {
                    Id = entity.Id,
                    Type = entity.Type.ToString().ToLower(),
                    PetType = entity.PetType,
                    Breed = entity.Breed,
                    ColorMarkings = entity.ColorMarkings,
                    DateLastSeen = entity.DateLastSeen,
                    Location = entity.Location,
                    Excerpt = entity.Description,
                    ImageUrl = entity.ImageUrl,
                    ReporterName = entity.ReporterName,
                    ReporterPhone = entity.ReporterPhone,
                    Status = entity.Status.ToString(),
                    CreatedAt = entity.CreatedAt
                };

                return CreatedAtAction(nameof(GetById), new { id = entity.Id }, result);
            }
            catch (InvalidOperationException inv)
            {
                return BadRequest(inv.Message);
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        // Update - owner/admin only (requires auth)
        [Authorize]
        [HttpPut("reports/{id:int}")]
        public IActionResult Update(int id, [FromForm] SaveLostFoundReportDto dto)
        {
            try
            {
                var entity = _db.Set<LostFoundReport>().FirstOrDefault(x => x.Id == id);
                if (entity == null) return NotFound();

                // TODO: enforce ownership/admin check here

                if (!string.IsNullOrWhiteSpace(dto.PetType)) entity.PetType = dto.PetType;
                entity.Breed = dto.Breed ?? entity.Breed;
                if (!string.IsNullOrWhiteSpace(dto.ColorMarkings)) entity.ColorMarkings = dto.ColorMarkings;
                if (dto.DateLastSeen != default) entity.DateLastSeen = dto.DateLastSeen;
                if (!string.IsNullOrWhiteSpace(dto.Location)) entity.Location = dto.Location;
                entity.Description = dto.Description ?? entity.Description;
                entity.UpdatedAt = DateTime.UtcNow;

                if (dto.ImageFile != null)
                {
                    // delete old if present
                    if (!string.IsNullOrEmpty(entity.ImageFileName))
                        _imageStorage.DeleteImage(entity.ImageFileName);

                    var saved = _imageStorage.SaveLostFoundImageAsync(dto.ImageFile).GetAwaiter().GetResult();
                    entity.ImageUrl = saved.Url;
                    entity.ImageFileName = saved.FileName;
                }

                _db.SaveChanges();
                return Ok();
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        // Delete (soft delete recommended; here we mark IsPublished=false)
        [Authorize]
        [HttpDelete("reports/{id:int}")]
        public IActionResult Delete(int id)
        {
            try
            {
                var e = _db.Set<LostFoundReport>().FirstOrDefault(x => x.Id == id);
                if (e == null) return NotFound();

                // TODO: check ownership/admin
                e.IsPublished = false;
                e.UpdatedAt = DateTime.UtcNow;
                _db.SaveChanges();

                return Ok();
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        // Summary
        [HttpGet("summary")]
        public IActionResult Summary()
        {
            try
            {
                var q = _db.Set<LostFoundReport>().Where(r => r.IsPublished);

                var lost = q.Count(r => r.Type == LostFoundReportType.Lost);
                var found = q.Count(r => r.Type == LostFoundReportType.Found);
                var reunited = q.Count(r => r.Status == LostFoundReportStatus.Reunited);

                return Ok(new LostFoundSummaryDto
                {
                    LostCount = lost,
                    FoundCount = found,
                    ReunitedCount = reunited
                });
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        // Search-similar (stub - returns empty matches; integrate AI service here later)
        [HttpPost("search-similar")]
        public IActionResult SearchSimilar([FromForm] SearchSimilarRequestDto req)
        {
            try
            {
                if (req.ImageFile == null) return BadRequest("ImageFile is required");

                // validate file size/type via image storage service (call SaveLostFoundImageAsync to validate)
                // but do not persist query image — here we validate only
                try
                {
                    var saved = _imageStorage.SaveLostFoundImageAsync(req.ImageFile).GetAwaiter().GetResult();
                    // delete immediately since this is only for searching (or keep in temp area)
                    _imageStorage.DeleteImage(saved.FileName);
                }
                catch (Exception ex)
                {
                    return BadRequest(ex.Message);
                }

                // TODO: call AI matching service to return matches
                var resp = new SearchSimilarResponseDto
                {
                    // QueryId auto-generated
                    Matches = new System.Collections.Generic.List<SearchMatchDto>()
                };

                return Ok(resp);
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        // Contact logging / reveal contact (simple stub)
        [HttpPost("reports/{id:int}/contact")]
        [Authorize] // optionally require auth
        public IActionResult Contact(int id)
        {
            try
            {
                var r = _db.Set<LostFoundReport>().FirstOrDefault(x => x.Id == id);
                if (r == null) return NotFound();

                // Optionally log contact attempt (not implemented)
                // For now return phone (in production protect / rate-limit)
                return Ok(new { phone = r.ReporterPhone });
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }
    }
}
