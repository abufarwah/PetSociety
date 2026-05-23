namespace Petsociety.DTOs.Community
{
    public class SaveChannelDto
    {
        public long Id { get; set; } // 0 for Add
        public string Name { get; set; } = null!;
        public string? Description { get; set; }
        public string? Icon { get; set; }
    }
}