using System.Collections.Generic;

namespace Petsociety.DTOs.LostFound
{
    public class SearchMatchDto
    {
        public LostFoundReportDto Post { get; set; } = null!;
        public double Confidence { get; set; }
    }

    public class SearchSimilarResponseDto
    {
        public string QueryId { get; set; } = System.Guid.NewGuid().ToString();
        public List<SearchMatchDto> Matches { get; set; } = new();
    }
}