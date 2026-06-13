using Petsociety.Models;

namespace Petsociety.Model
{
    public class CommunityMember
    {
        public long Id { get; set; }

        public long ChannelId { get; set; }

        public int UserId { get; set; }

        public DateTime JoinedAt { get; set; } = DateTime.UtcNow;

        public CommunityChannel? Channel { get; set; }

        public User? User { get; set; }
    }
}