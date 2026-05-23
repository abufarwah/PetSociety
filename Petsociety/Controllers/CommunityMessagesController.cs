using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Petsociety.Model;
using Petsociety.DTOs.Community;
using System;
using System.Linq;
using System.Security.Claims;
using Microsoft.EntityFrameworkCore;

namespace Petsociety.Controllers
{
    [Authorize]
    [Route("api/[controller]")]
    [ApiController]
    public class CommunityMessagesController : ControllerBase
    {
        private readonly PetDbContext _dbContext;
        public CommunityMessagesController(PetDbContext dbContext)
        {
            _dbContext = dbContext;
        }

        [HttpGet("GetByChannel")]
        public IActionResult GetByChannel([FromQuery] FilterMessagesDto filterDto)
        {
            try
            {
                if (filterDto.ChannelId == null)
                    return BadRequest("ChannelId is required.");

                //var query = from msg in _dbContext.CommunityMessages
                //            from user in _dbContext.Users.Where(u => u.Id == msg.UserId).DefaultIfEmpty()
                //            where msg.ChannelId == filterDto.ChannelId
                //            orderby msg.SentAt descending
                //            select new MessageDto
                //            {
                //                Id = msg.Id,
                //                ChannelId = msg.ChannelId,
                //                UserId = msg.UserId,
                //                UserName = user != null ? user.FullName : string.Empty,
                //                MessageText = msg.MessageText,
                //                SentAt = msg.SentAt
                //            };
                var query = _dbContext.CommunityMessages
    .Where(msg => msg.ChannelId == filterDto.ChannelId)
    .OrderByDescending(msg => msg.SentAt)
    .Select(msg => new MessageDto
    {
        Id = msg.Id,
        ChannelId = msg.ChannelId,
        UserId = msg.UserId,
        UserName = msg.User.FullName,
        MessageText = msg.MessageText,
        SentAt = msg.SentAt
    });

                if (filterDto.Take != null && filterDto.Take > 0)
                    query = query.Take(filterDto.Take.Value);

                var items = query.OrderBy(x => x.SentAt).ToList(); // return ascending for UI
                return Ok(items);
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [HttpPost("Add")]
        public IActionResult Add([FromBody] SaveMessageDto dto)
        {
            try
            {
                if (dto.ChannelId <= 0 || string.IsNullOrWhiteSpace(dto.MessageText))
                    return BadRequest("ChannelId and MessageText are required.");

                var ch = _dbContext.CommunityChannels.FirstOrDefault(x => x.Id == dto.ChannelId);
                if (ch == null)
                    return BadRequest("Channel Does Not Exist");

                var email = User.Claims.FirstOrDefault(c => c.Type == ClaimTypes.Email)?.Value;
                if (string.IsNullOrEmpty(email))
                    return BadRequest("User email claim missing.");

                var user = _dbContext.Users.FirstOrDefault(u => u.Email == email);
                if (user == null)
                    return BadRequest("Authenticated user not found in database.");

                var msg = new CommunityMessage
                {
                    ChannelId = dto.ChannelId,
                    UserId = user.Id,
                    MessageText = dto.MessageText,
                    SentAt = DateTime.UtcNow
                };

                _dbContext.CommunityMessages.Add(msg);
                _dbContext.SaveChanges();

                // optional: return created message DTO
                var result = new MessageDto
                {
                    Id = msg.Id,
                    ChannelId = msg.ChannelId,
                    UserId = msg.UserId,
                    UserName = user.FullName,
                    MessageText = msg.MessageText,
                    SentAt = msg.SentAt
                };

                return Ok(result);
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        //[HttpDelete("Delete")]
        //public IActionResult Delete([FromQuery] long Id)
        //{
        //    try
        //    {
        //        var msg = _dbContext.CommunityMessages.FirstOrDefault(x => x.Id == Id);
        //        if (msg == null)
        //            return BadRequest("Message Does Not Exist");

        //        _dbContext.CommunityMessages.Remove(msg);
        //        _dbContext.SaveChanges();
        //        return Ok();
        //    }
        //    catch (Exception ex)
        //    {
        //        return BadRequest(ex.Message);
        //    }
        //}

        [HttpDelete("Delete")]
        public IActionResult Delete([FromQuery] long Id)
        {
            var msg = _dbContext.CommunityMessages.FirstOrDefault(x => x.Id == Id);
            if (msg == null)
                return BadRequest("Message Does Not Exist");

            var email = User.Claims.FirstOrDefault(c => c.Type == ClaimTypes.Email)?.Value;
            var user = _dbContext.Users.FirstOrDefault(u => u.Email == email);

            if (user == null)
                return Unauthorized();

            if (msg.UserId != user.Id)
                return Forbid();

            _dbContext.CommunityMessages.Remove(msg);
            _dbContext.SaveChanges();

            return Ok();
        }
    }
}