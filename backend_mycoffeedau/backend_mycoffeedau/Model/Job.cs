using backend_mycoffeedau.Model;

namespace backend_mycoffeedau.Models
{
    public class Job
    {
        public string Id { get; set; } = string.Empty;
        public string Position { get; set; } = string.Empty;
        public string Location { get; set; } = string.Empty;
        public string Salary { get; set; } = string.Empty;

        // Trong C#, chúng ta dùng string cho các loại Union Type từ TypeScript
        // Bạn có thể giới hạn giá trị này ở tầng Logic (Full-time hoặc Part-time)
        public string Type { get; set; } = "Full-time";

        public string Description { get; set; } = string.Empty;

        public List<JobRequirements> requirements { get; set; } = new();

        public string Deadline { get; set; } = string.Empty;
    }
}