using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using System;
using System.IO;
using System.Threading.Tasks;

namespace Petsociety.Services
{
    public class LocalImageStorageService : IImageStorageService
    {
        private readonly IWebHostEnvironment _env;
        private const long MaxBytes = 10 * 1024 * 1024; // 10 MB
        private static readonly string[] AllowedMime = new[] { "image/jpeg", "image/png", "image/webp" };

        public LocalImageStorageService(IWebHostEnvironment env)
        {
            _env = env;
        }

        public async Task<(string Url, string FileName)> SaveLostFoundImageAsync(IFormFile file)
        {
            if (file == null) throw new ArgumentNullException(nameof(file));
            if (file.Length == 0 || file.Length > MaxBytes) throw new InvalidOperationException("Invalid file size");
            if (Array.IndexOf(AllowedMime, file.ContentType.ToLower()) < 0) throw new InvalidOperationException("Unsupported image type");

            var uploadsFolder = Path.Combine(_env.WebRootPath ?? "wwwroot", "uploads", "lostfound");
            if (!Directory.Exists(uploadsFolder)) Directory.CreateDirectory(uploadsFolder);

            var ext = Path.GetExtension(file.FileName).ToLowerInvariant();
            var fileName = Guid.NewGuid().ToString("N") + ext;
            var path = Path.Combine(uploadsFolder, fileName);

            await using var stream = new FileStream(path, FileMode.Create);
            await file.CopyToAsync(stream);

            var url = "/uploads/lostfound/" + fileName;
            return (url, fileName);
        }

        public void DeleteImage(string fileName)
        {
            if (string.IsNullOrEmpty(fileName)) return;
            var uploadsFolder = Path.Combine(_env.WebRootPath ?? "wwwroot", "uploads", "lostfound");
            var path = Path.Combine(uploadsFolder, fileName);
            if (File.Exists(path)) File.Delete(path);
        }
    }
}