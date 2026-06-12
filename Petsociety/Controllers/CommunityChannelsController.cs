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


        //[HttpGet("GetAll")]
        //public IActionResult GetAll([FromQuery] FilterChannelsDto filterDto)
        //{
        //    var messageCounts = _dbContext.CommunityMessages
        //        .GroupBy(m => m.ChannelId)
        //        .Select(g => new
        //        {
        //            ChannelId = g.Key,
        //            Count = g.Count()
        //        });

        //    var data = from ch in _dbContext.CommunityChannels
        //               join msg in messageCounts
        //               on ch.Id equals msg.ChannelId into msgGroup
        //               from msg in msgGroup.DefaultIfEmpty()
        //               where (filterDto.Name == null ||
        //                      EF.Functions.Like(ch.Name, $"%{filterDto.Name}%"))
        //               select new ChannelDto
        //               {
        //                   Id = ch.Id,
        //                   Name = ch.Name,
        //                   Description = ch.Description,
        //                   Icon = ch.Icon,
        //                   MembersCount = ch.MembersCount,
        //                   CreatedAt = ch.CreatedAt,
        //                   MessagesCount = msg != null ? msg.Count : 0
        //               };

        //    return Ok(data.OrderByDescending(x => x.CreatedAt));
        //}
        [HttpGet("GetAll")]
        public IActionResult GetAll([FromQuery] FilterChannelsDto filterDto)
        {
            try
            {
                // استعلام مباشر ونظيف بدون Join معقد يسبب مشاكل مع التشانيلز الفارغة
                var query = _dbContext.CommunityChannels
                    .Where(ch => filterDto.Name == null || EF.Functions.Like(ch.Name, $"%{filterDto.Name}%"))
                    .Select(ch => new ChannelDto
                    {
                        Id = ch.Id,
                        Name = ch.Name,
                        Description = ch.Description,
                        Icon = ch.Icon,
                        MembersCount = ch.MembersCount,
                        CreatedAt = ch.CreatedAt,
                        // حساب عدد المسجات مباشرة وبأمان لكل تشانيل (حتى لو كانت 0)
                        MessagesCount = _dbContext.CommunityMessages.Count(m => m.ChannelId == ch.Id)
                    });

                return Ok(query.OrderByDescending(x => x.CreatedAt).ToList());
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
    }
}