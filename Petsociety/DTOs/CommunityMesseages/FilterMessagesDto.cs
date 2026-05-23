namespace Petsociety.DTOs.Community
{
    public class FilterMessagesDto
    {
        public long? ChannelId { get; set; }
        public int? Take { get; set; } // optional: latest N messages
    }
}