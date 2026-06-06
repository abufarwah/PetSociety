using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;


namespace Petsociety.Services
{
    public interface IImageStorageService
    {
        Task<(string Url, string FileName)> SaveLostFoundImageAsync(IFormFile file);
        void DeleteImage(string fileName);
    }
}