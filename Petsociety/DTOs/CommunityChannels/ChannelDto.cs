using System;

namespace Petsociety.DTOs.Community
{
    public class ChannelDto
    {
        public long Id { get; set; }
        public string Name { get; set; } = null!;
        public string? Description { get; set; }
        public string? Icon { get; set; }
        public int MembersCount { get; set; }
        public DateTime CreatedAt { get; set; }
        public int MessagesCount { get; set; }
        public bool IsJoined { get; set; }
    }
}