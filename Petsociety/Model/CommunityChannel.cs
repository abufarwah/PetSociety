using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace Petsociety.Model
{
    public class CommunityChannel
    {
        public long Id { get; set; }

        [Required]
        [MaxLength(150)]
        public string Name { get; set; } = null!;

        [MaxLength(500)]
        public string? Description { get; set; }

        [MaxLength(250)]
        public string? Icon { get; set; }

        public int MembersCount { get; set; } = 0;

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        // Navigation
        public List<CommunityMessage> Messages { get; set; } = new();
    }
}