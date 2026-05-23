using Petsociety.Models;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Petsociety.Model
{
    public class Subscription
    {
        [Key]
        public int Id { get; set; }

        [Required]
        public int UserId { get; set; } 

        [ForeignKey("UserId")]
        public User User { get; set; } 

        [Required]
        public string PackageName { get; set; } 

        [Required]
        [Column(TypeName = "decimal(18,2)")]
        public decimal Price { get; set; } 

        public DateTime StartDate { get; set; }

        public DateTime EndDate { get; set; } 

        public bool IsActive { get; set; } 
    }
}