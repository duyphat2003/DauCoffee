namespace backend_mycoffeedau.Model
{
    public class Voucher
    {
        public string Id { get; set; } = string.Empty; // Khớp NVARCHAR(50)
        public string Content { get; set; } = string.Empty;
        public string PointRequirement { get; set; } = string.Empty;
        public int Point { get; set; } = 0;
    }
}
