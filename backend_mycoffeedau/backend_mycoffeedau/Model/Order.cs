namespace backend_mycoffeedau.Models
{
    public class Order
    {
        public string Id { get; set; } = string.Empty;
        public string IdUser { get; set; } = string.Empty;
        public DateTime Date { get; set; }
        public decimal Total { get; set; }
        public string Status { get; set; } = "Chờ xác nhận"; // Trạng thái mặc định
        // Trong C#, chúng ta thường dùng List để đại diện cho OrderDetail[]
        public List<OrderDetail> Items { get; set; } = new();
    }
}