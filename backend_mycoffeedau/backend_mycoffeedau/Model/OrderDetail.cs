namespace backend_mycoffeedau.Models
{
    public class OrderDetail
    {
        public int Id { get; set; } // 🔥 thêm cái này
        public string OrderId { get; set; } = string.Empty;
        public string IdDrink { get; set; } = string.Empty;
        public string Name { get; set; } = string.Empty;
        public int Quantity { get; set; }
        public decimal PriceAtPurchase { get; set; }
    }
}