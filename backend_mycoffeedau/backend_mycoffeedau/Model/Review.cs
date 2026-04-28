namespace backend_mycoffeedau.Models
{
    public class Review
    {
        public int Id { get; set; }
        public string IdUser { get; set; } = string.Empty;
        public string IdDrink { get; set; } = string.Empty;
        public int Rating { get; set; } // 1-5 sao
        public string Comment { get; set; } = string.Empty;
        public string Avatar { get; set; } = string.Empty;
        public string UserName { get; set; } = string.Empty;
        public DateTime DateReview { get; set; } = DateTime.Now;
    }
}