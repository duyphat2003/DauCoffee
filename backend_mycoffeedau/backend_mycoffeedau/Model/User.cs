namespace backend_mycoffeedau.Models
{
    public class User
    {
        public string Id { get; set; } = string.Empty;
        public string NameDisplay { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string Password { get; set; } = string.Empty; // Lưu ý: Thực tế cần mã hóa (Hash)
        public string Phone { get; set; } = string.Empty;
        public string Address { get; set; } = string.Empty;
        public string Avatar { get; set; } = string.Empty;
        public string Rank { get; set; } = "Tập Sự";
        public int Points { get; set; } = 0;
    }
}