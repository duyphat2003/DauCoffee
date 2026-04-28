namespace backend_mycoffeedau.Models
{
    public class Activity
    {
        public string Id { get; set; } = string.Empty; // Khớp NVARCHAR(50)
        public string Title { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public string Image { get; set; } = string.Empty;
        public DateTime DateCreate { get; set; } = DateTime.Now;
        public string IdCategory { get; set; } = string.Empty;

        // Badge dùng để hiển thị các nhãn như "Hot", "New", hoặc "Event"
        public string? Badge { get; set; }
    }
}