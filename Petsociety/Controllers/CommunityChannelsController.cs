using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Petsociety.DTOs.Community;
using Petsociety.Model;
using System;
using System.Linq;

namespace Petsociety.Controllers
{
    //[Authorize]
    [Route("api/[controller]")]
    [ApiController]
    public class CommunityChannelsController : ControllerBase
    {
        private readonly PetDbContext _dbContext;
        public CommunityChannelsController(PetDbContext dbContext)
        {
            _dbContext = dbContext;
        }

        //[AllowAnonymous]
        //[HttpGet("GetAll")]
        //public IActionResult GetAll([FromQuery] FilterChannelsDto filterDto)
        //{
        //    try
        //    {
        //        var query = _dbContext.CommunityChannels
        //            .Where(ch => filterDto.Name == null || EF.Functions.Like(ch.Name, $"%{filterDto.Name}%"))
        //            .Select(ch => new ChannelDto
        //            {
        //                Id = ch.Id,
        //                Name = ch.Name,
        //                Description = ch.Description,
        //                Icon = ch.Icon,
        //                MembersCount = ch.MembersCount,
        //                CreatedAt = ch.CreatedAt,
        //                MessagesCount = _dbContext.CommunityMessages.Count(m => m.ChannelId == ch.Id)
        //            });

        //        return Ok(query.OrderByDescending(x => x.CreatedAt).ToList());
        //    }
        //    catch (Exception ex)
        //    {
        //        return BadRequest(ex.Message);
        //    }
        //}
        [AllowAnonymous]
        [HttpGet("GetAll")]
        public IActionResult GetAll([FromQuery] FilterChannelsDto filterDto)
        {
            try
            {
                int userId = 0;

                if (User.Identity?.IsAuthenticated == true)
                {
                    var claim = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier);

                    if (claim != null)
                        userId = int.Parse(claim.Value);
                }

                var query = _dbContext.CommunityChannels
                    .Where(ch => filterDto.Name == null ||
                                 EF.Functions.Like(ch.Name, $"%{filterDto.Name}%"))
                    .Select(ch => new ChannelDto
                    {
                        Id = ch.Id,
                        Name = ch.Name,
                        Description = ch.Description,
                        Icon = ch.Icon,

                        MembersCount = _dbContext.CommunityMembers
                            .Count(x => x.ChannelId == ch.Id),

                        MessagesCount = _dbContext.CommunityMessages
                            .Count(m => m.ChannelId == ch.Id),

                        CreatedAt = ch.CreatedAt,

                        IsJoined = userId != 0 &&
                            _dbContext.CommunityMembers.Any(x =>
                                x.ChannelId == ch.Id &&
                                x.UserId == userId)
                    });

                return Ok(query.OrderByDescending(x => x.CreatedAt).ToList());
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }
        [AllowAnonymous]
        [HttpGet("GetById")]
        public IActionResult GetById([FromQuery] long Id)
        {
            try
            {
                var item = _dbContext.CommunityChannels
                    .Select(ch => new ChannelDto
                    {
                        Id = ch.Id,
                        Name = ch.Name,
                        Description = ch.Description,
                        Icon = ch.Icon,
                        MembersCount = ch.MembersCount,
                        CreatedAt = ch.CreatedAt,
                        MessagesCount = _dbContext.CommunityMessages.Count(m => m.ChannelId == ch.Id)
                    })
                    .FirstOrDefault(x => x.Id == Id);

                if (item == null)
                    return NotFound();

                return Ok(item);
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [Authorize(Roles = "Admin")]
        [HttpPost("Add")]
        public IActionResult Add([FromBody] SaveChannelDto dto)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(dto.Name))
                    return BadRequest("Channel name is required.");

                var channel = new CommunityChannel
                {
                    Name = dto.Name,
                    Description = dto.Description,
                    Icon = dto.Icon,
                    MembersCount = 0,
                    CreatedAt = DateTime.UtcNow
                };

                _dbContext.CommunityChannels.Add(channel);
                _dbContext.SaveChanges();
                return Ok();
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [Authorize(Roles = "Admin")]
        [HttpPut("Update")]
        public IActionResult Update([FromBody] SaveChannelDto dto)
        {
            try
            {
                var ch = _dbContext.CommunityChannels.FirstOrDefault(x => x.Id == dto.Id);
                if (ch == null)
                    return NotFound("Channel Does Not Exist");

                ch.Name = dto.Name;
                ch.Description = dto.Description;
                ch.Icon = dto.Icon;

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
                var ch = _dbContext.CommunityChannels.FirstOrDefault(x => x.Id == Id);
                if (ch == null)
                    return NotFound("Channel Does Not Exist");

                _dbContext.CommunityChannels.Remove(ch);
                _dbContext.SaveChanges();
                return Ok();
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [Authorize]
        [HttpPost("Join")]
        public IActionResult Join(long channelId)
        {
            var userId = int.Parse(
                User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)!.Value
            );

            var exists = _dbContext.CommunityMembers.Any(x =>
                x.ChannelId == channelId &&
                x.UserId == userId);

            if (exists)
                return Ok();

            _dbContext.CommunityMembers.Add(
                new CommunityMember
                {
                    ChannelId = channelId,
                    UserId = userId
                });

            _dbContext.SaveChanges();

            return Ok();
        }

        [Authorize]
        [HttpPost("Leave")]
        public IActionResult Leave(long channelId)
        {
            var userId = int.Parse(
                User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)!.Value
            );

            var member = _dbContext.CommunityMembers.FirstOrDefault(x =>
                x.ChannelId == channelId &&
                x.UserId == userId);

            if (member == null)
                return Ok();

            _dbContext.CommunityMembers.Remove(member);
            _dbContext.SaveChanges();

            return Ok();
        }

        [AllowAnonymous]
        [HttpGet("GetMembers")]
        public IActionResult GetMembers([FromQuery] long channelId)
        {
            try
            {
                var memberUserIds = _dbContext.CommunityMembers
                    .Where(m => m.ChannelId == channelId)
                    .Select(m => m.UserId)
                    .ToList();

                var members = _dbContext.Users
                    .Where(u => memberUserIds.Contains(u.Id))
                    .Select(u => new
                    {
                        UserId = u.Id,
                        UserName = u.FullName 
                    })
                    .ToList();

                return Ok(members);
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }
    }

}