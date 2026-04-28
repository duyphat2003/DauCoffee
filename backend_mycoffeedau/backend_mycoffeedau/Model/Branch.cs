namespace backend_mycoffeedau.Models
{
    public class Branch
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Address { get; set; } = string.Empty;
        public string Phone { get; set; } = string.Empty;
        public string Hours { get; set; } = string.Empty;
        public string MapUrl { get; set; } = string.Empty;
        public string Image { get; set; } = string.Empty;
    }
}