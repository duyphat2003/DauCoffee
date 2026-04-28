
using backend_mycoffeedau.Data;
using Microsoft.EntityFrameworkCore;
using System.Text.Json;

namespace backend_mycoffeedau
{
    public class Program
    {
        public static void Main(string[] args)
        {
            var builder = WebApplication.CreateBuilder(args);

            builder.Services.AddDbContext<AppDbContext>(options =>
                options.UseSqlServer(
                    builder.Configuration.GetConnectionString("DefaultConnection"),
                    sql => sql.EnableRetryOnFailure()
                ));

            builder.Services.AddControllers()
            .AddJsonOptions(options => {
            options.JsonSerializerOptions.PropertyNamingPolicy = JsonNamingPolicy.CamelCase;
            });

            builder.Services.AddCors(options =>
            {
                options.AddPolicy("AllowAll",
                    policy => policy.AllowAnyOrigin()
                                    .AllowAnyMethod()
                                    .AllowAnyHeader());
            });


            var app = builder.Build();

            app.UseStaticFiles(); // Dòng này cực kỳ quan trọng để load được ảnh từ thư mục wwwroot hoặc thư mục định nghĩa
            app.UseCors("AllowAll"); // Đảm bảo CORS đã được bật cho Frontend

            app.MapControllers();

            app.Run();
        }
    }
}
