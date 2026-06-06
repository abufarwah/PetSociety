using System.Collections.Generic;

namespace Petsociety.DTOs.LostFound
{
    public class LostFoundListResponseDto
    {
        public List<LostFoundReportDto> Items { get; set; } = new();
        public int Total { get; set; }
        public int Page { get; set; }
        public int PageSize { get; set; }
    }
}