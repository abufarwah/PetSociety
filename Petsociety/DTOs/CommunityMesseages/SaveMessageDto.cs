namespace Petsociety.DTOs.Community
{
    public class SaveMessageDto
    {
        public long ChannelId { get; set; }
        public string MessageText { get; set; } = null!;
    }
}