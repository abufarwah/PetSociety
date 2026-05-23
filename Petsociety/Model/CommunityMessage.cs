using Petsociety.Models;
using System;
using System.ComponentModel.DataAnnotations;

namespace Petsociety.Model
{
    public class CommunityMessage
    {
        public long Id { get; set; }

        [Required]
        public long ChannelId { get; set; }

        [Required]
        public int UserId { get; set; } // references User.Id (int in your project)

        [Required]
        [MaxLength(2000)]
        public string MessageText { get; set; } = null!;

        public DateTime SentAt { get; set; } = DateTime.UtcNow;

        // Navigation
        public CommunityChannel? Channel { get; set; }
        public User? User { get; set; }
    }
}