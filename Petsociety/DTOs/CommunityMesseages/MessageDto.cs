using System;

namespace Petsociety.DTOs.Community
{
    public class MessageDto
    {
        public long Id { get; set; }
        public long ChannelId { get; set; }
        public int UserId { get; set; }
        public string UserName { get; set; } = string.Empty;
        public string MessageText { get; set; } = null!;
        public DateTime SentAt { get; set; }

    }
}