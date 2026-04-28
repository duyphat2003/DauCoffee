namespace backend_mycoffeedau.Model
{
    public class UserVoucher
    {
        public int Id { get; set; }
        public string IdUser { get; set; } = string.Empty;
        public string IdVoucher { get; set; } = string.Empty;
        public DateTime RedeemedDate { get; set; } = DateTime.Now;
        public bool IsUsed { get; set; } = false;
    }
}
