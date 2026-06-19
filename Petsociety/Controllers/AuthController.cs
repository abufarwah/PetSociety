using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.IdentityModel.Tokens;
using Petsociety.DTOs.AuthDTOs;
using Petsociety.Model;
using Petsociety.Models;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

namespace Petsociety.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AuthController : ControllerBase
    {
        private readonly PetDbContext _dbContext;
        private readonly IConfiguration _configuration;

        public AuthController(
            PetDbContext dbContext,
            IConfiguration configuration)
        {
            _dbContext = dbContext;
            _configuration = configuration;
        }

        [HttpPost("Register")]
        public IActionResult Register(SigninDTOs dto)
        {
            try
            {
                if (dto.Password != dto.ConfirmPassword)
                    return BadRequest("Passwords do not match");

                bool exists = _dbContext.Users.Any(x => x.Email == dto.Email);

                if (exists)
                    return BadRequest("Email already exists");

                var user = new User
                {
                    FullName = dto.FullName,
                    Email = dto.Email,
                    Phone = dto.Phone,
                    PasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.Password),
                    Role = "User" ,
                    IsActive = true,
                    IsDeleted = false
                };

                _dbContext.Users.Add(user);
                _dbContext.SaveChanges();

                return Ok("Account Created");
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [HttpPost("Login")]
        public IActionResult Login(LoginDTOs dto)
        {
            try
            {
                var user = _dbContext.Users
                    .FirstOrDefault(x => x.Email == dto.Email);

                if (user == null)
                    return BadRequest("Invalid email or password");

                if (user.IsDeleted)
                    return BadRequest("Account has been deleted");

                if (!user.IsActive)
                    return BadRequest("Account is inactive");

                if (!BCrypt.Net.BCrypt.Verify(dto.Password, user.PasswordHash))
                    return BadRequest("Invalid email or password");

                var token = GenerateToken(user);

                return Ok(new
                {
                    token,
                    id = user.Id,
                    fullName = user.FullName,
                    email = user.Email,
                    role = user.Role
                });
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [Authorize]
        [HttpGet("me")]
        public IActionResult Me()
        {
            return Ok(new
            {
                Id = User.FindFirst(ClaimTypes.NameIdentifier)?.Value,
                Name = User.FindFirst(ClaimTypes.Name)?.Value,
                Email = User.FindFirst(ClaimTypes.Email)?.Value,
                Role = User.FindFirst(ClaimTypes.Role)?.Value
            });
        }

        private string GenerateToken(User user)
        {
            var jwtKey = _configuration["Jwt:Key"]!;

            var key = new SymmetricSecurityKey(
                Encoding.UTF8.GetBytes(jwtKey));

            var claims = new List<Claim>
            {
                new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
                new Claim(ClaimTypes.Email, user.Email),
                new Claim(ClaimTypes.Name, user.FullName),
                new Claim(ClaimTypes.Role, user.Role)
            };

            var token = new JwtSecurityToken(
                issuer: _configuration["Jwt:Issuer"],
                audience: _configuration["Jwt:Audience"],
                claims: claims,
                expires: DateTime.UtcNow.AddDays(1),
                signingCredentials: new SigningCredentials(
                    key,
                    SecurityAlgorithms.HmacSha256)
            );

            return new JwtSecurityTokenHandler().WriteToken(token);
        }
    }
}