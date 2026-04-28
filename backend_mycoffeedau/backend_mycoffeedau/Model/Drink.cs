namespace backend_mycoffeedau.Models
{
    public class Drink
    {
        public string Id { get; set; } = string.Empty;
        public string Name { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public string Ingredients { get; set; } = string.Empty;
        public decimal Price { get; set; }
        public int PromotionPercent { get; set; }
        public string CategoryId { get; set; } = string.Empty;
        public string Image { get; set; } = string.Empty;
        public bool IsBestSeller { get; set; }
        public bool IsFeatured { get; set; }
        public bool IsPromotion { get; set; }
    }
}