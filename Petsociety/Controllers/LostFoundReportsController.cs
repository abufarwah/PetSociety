using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Petsociety.DTOs.LostFound;
using Petsociety.Model;
using Petsociety.Services;
using System;
using System.Linq;
using System.Security.Claims;

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

        // ───────────────────────────────
        // GET LIST (Public)
        // ───────────────────────────────
        [HttpGet("reports")]
        public IActionResult GetReports(string? type, string? petType,
            string? status, string? search, int page = 1, int pageSize = 12)
        {
            try
            {
                var q = _db.LostFoundReports
                    .AsNoTracking()
                    .Where(r => r.IsPublished);

                if (!string.IsNullOrWhiteSpace(type) &&
                    Enum.TryParse<LostFoundReportType>(type, true, out var rtype))
                    q = q.Where(r => r.Type == rtype);

                if (!string.IsNullOrWhiteSpace(petType))
                    q = q.Where(r => r.PetType.ToLower().Contains(petType.ToLower()));

                if (!string.IsNullOrWhiteSpace(status) &&
                    Enum.TryParse<LostFoundReportStatus>(status, true, out var st))
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

                var items = q
                    .OrderByDescending(r => r.CreatedAt)
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
                        Excerpt = (r.Description ?? "").Length > 200
                            ? r.Description.Substring(0, 200) + "..."
                            : r.Description,
                        ImageUrl = r.ImageUrl,
                        ReporterName = r.ReporterName,
                        ReporterUserId = r.ReporterUserId,
                        ReporterPhone = r.ReporterPhone,
                        Status = r.Status.ToString(),
                        CreatedAt = r.CreatedAt
                    })
                    .ToList();

                return Ok(new LostFoundListResponseDto
                {
                    Items = items,
                    Total = total,
                    Page = page,
                    PageSize = pageSize
                });
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        // ───────────────────────────────
        // GET BY ID
        // ───────────────────────────────
        [HttpGet("reports/{id:int}")]
        public IActionResult GetById(int id)
        {
            var r = _db.LostFoundReports
                .AsNoTracking()
                .FirstOrDefault(x => x.Id == id && x.IsPublished);

            if (r == null)
                return NotFound();

            return Ok(r);
        }

        // ───────────────────────────────
        // CREATE
        // ───────────────────────────────
        [HttpPost("reports")]
        [Authorize] // 🔥 لازم يكون مسجل دخول
        public IActionResult Create([FromForm] SaveLostFoundReportDto dto)
        {
            try
            {
                var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                int? userId = int.TryParse(userIdClaim, out var id) ? id : null;

                string? imageUrl = null;
                string? imageFileName = null;

                if (dto.ImageFile != null)
                {
                    var saved = _imageStorage.SaveLostFoundImageAsync(dto.ImageFile)
                        .GetAwaiter().GetResult();

                    imageUrl = saved.Url;
                    imageFileName = saved.FileName;
                }

                var entity = new LostFoundReport
                {
                    Type = Enum.Parse<LostFoundReportType>(dto.Type, true),
                    PetType = dto.PetType,
                    Breed = dto.Breed ?? "",
                    ColorMarkings = dto.ColorMarkings,
                    DateLastSeen = dto.DateLastSeen == default ? DateTime.UtcNow : dto.DateLastSeen,
                    Location = dto.Location,
                    Description = dto.Description ?? "",

                    ImageUrl = imageUrl,
                    ImageFileName = imageFileName,

                    ReporterName = dto.ReporterName,
                    ReporterPhone = dto.ReporterPhone,

                    // تعبئة الأعمدة القديمة
           
                    DateText = dto.DateLastSeen.ToString("yyyy-MM-dd"),

                    ReporterUserId = userId,
                    Status = LostFoundReportStatus.Open,
                    IsPublished = true,
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow
                };

                _db.LostFoundReports.Add(entity);
                _db.SaveChanges();

                return Ok(entity);
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        // ───────────────────────────────
        // UPDATE (Owner OR Admin)
        // ───────────────────────────────
        // ───────────────────────────────
        // UPDATE (Owner OR Admin) - تعديل محسّن لتجنب مشاكل التتبع والإرجاع
        // ───────────────────────────────
        [Authorize]
        [HttpPut("reports/{id:int}")]
        public IActionResult Update(int id, [FromForm] SaveLostFoundReportDto dto)
        {
            var entity = _db.LostFoundReports.FirstOrDefault(x => x.Id == id);
            if (entity == null) return NotFound();

            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            int.TryParse(userIdClaim, out var userId);

            var isAdmin = User.IsInRole("Admin");
            var isOwner = entity.ReporterUserId == userId;

            if (!isAdmin && !isOwner) return Forbid();

            entity.PetType = dto.PetType ?? entity.PetType;
            entity.Breed = dto.Breed ?? entity.Breed;
            entity.ColorMarkings = dto.ColorMarkings ?? entity.ColorMarkings;
            entity.Location = dto.Location ?? entity.Location;
            entity.Description = dto.Description ?? entity.Description;
            entity.UpdatedAt = DateTime.UtcNow;

            if (dto.ImageFile != null)
            {
                if (!string.IsNullOrEmpty(entity.ImageFileName))
                    _imageStorage.DeleteImage(entity.ImageFileName);

                var saved = _imageStorage.SaveLostFoundImageAsync(dto.ImageFile).GetAwaiter().GetResult();
                entity.ImageUrl = saved.Url;
                entity.ImageFileName = saved.FileName;
            }

            try
            {
                _db.LostFoundReports.Attach(entity);
                _db.Entry(entity).State = EntityState.Modified;

                _db.SaveChanges();

                // تأكيد الـ Transaction يدوياً احتياطاً للتعديل أيضاً
                if (_db.Database.CurrentTransaction != null)
                {
                    _db.Database.CurrentTransaction.Commit();
                }

                return Ok(entity);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = "Update failed", error = ex.Message });
            }
        }

        // ───────────────────────────────
        // DELETE (Owner OR Admin) - نسخة قاطعة ومجبرة لقاعدة البيانات
        // ───────────────────────────────
        [Authorize]
        [HttpDelete("reports/{id:int}")]
        public IActionResult Delete(int id)
        {
            var entity = _db.LostFoundReports.FirstOrDefault(x => x.Id == id);
            if (entity == null)
                return NotFound(new { message = $"Report with ID {id} was not found." });

            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            int.TryParse(userIdClaim, out var userId);

            var isAdmin = User.IsInRole("Admin");
            var isOwner = entity.ReporterUserId == userId;

            if (!isAdmin && !isOwner)
                return Forbid("You do not have permission to delete this report.");

            try
            {
                // 1. وسم حالة العنصر كـ Deleted
                _db.Entry(entity).State = EntityState.Deleted;

                // 2. حفظ التغييرات أولاً في قاعدة البيانات
                int rowsAffected = _db.SaveChanges();

                // 3. تأكيد الـ Transaction (Commit) "بعد" نجاح الحفظ لقطع الشك باليقين
                if (_db.Database.CurrentTransaction != null)
                {
                    _db.Database.CurrentTransaction.Commit();
                }


                // 4. الفحص الجداري
                if (rowsAffected == 0)
                {
                    return BadRequest(new { message = "The command executed, but 0 rows were updated in the database." });
                }

                return Ok(new { success = true, message = "Report permanently deleted from database." });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = "Database rejected deletion.", error = ex.InnerException?.Message ?? ex.Message });
            }
        }
    }
}



