using System.Collections.Generic;

namespace Petsociety.DTOs.LostFound
{
    public class SearchMatchDto
    {
        public int ReportId { get; set; }
        public string Type { get; set; } = null!;
        public string PetType { get; set; } = null!;
        public string ImageUrl { get; set; } = null!;
        public double SimilarityScore { get; set; }
        public string Excerpt { get; set; } = string.Empty;
    }

    public class SearchSimilarResponseDto
    {
        public string QueryId { get; set; } = System.Guid.NewGuid().ToString();
        public List<SearchMatchDto> Matches { get; set; } = new();
    }
}