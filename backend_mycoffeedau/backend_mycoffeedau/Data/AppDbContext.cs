using backend_mycoffeedau.Model;
using backend_mycoffeedau.Models;
using Microsoft.EntityFrameworkCore;

namespace backend_mycoffeedau.Data
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

        public DbSet<Drink> Drinks { get; set; }
        public DbSet<Order> Orders { get; set; }
        public DbSet<Category> Categories { get; set; }
        public DbSet<User> Users { get; set; }
        public DbSet<Activity> Activities { get; set; }
        public DbSet<Voucher> Vouchers { get; set; }
        public DbSet<UserVoucher> UserVouchers { get; set; }
        public DbSet<Review> Reviews { get; set; }
        public DbSet<Branch> Branches { get; set; }
        public DbSet<Job> Jobs { get; set; }
        public DbSet<JobRequirements> jobRequirements { get; set; }

        // THÊM DÒNG NÀY ĐỂ HẾT LỖI
        public DbSet<FavoriteDrink> FavoriteDrinks { get; set; }

        // Thêm cấu hình bảng OrderDetail nếu bạn chưa có Controller riêng cho nó
        public DbSet<OrderDetail> OrderDetails { get; set; }


        // 👉 HÀM NẰM Ở ĐÂY
        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // Fix decimal
            modelBuilder.Entity<Drink>()
                .Property(d => d.Price)
                .HasPrecision(18, 2);

            modelBuilder.Entity<Order>()
                .Property(o => o.Total)
                .HasPrecision(18, 2);

            modelBuilder.Entity<OrderDetail>()
                .Property(od => od.PriceAtPurchase)
                .HasPrecision(18, 2);

            // Fix primary key OrderDetail
            modelBuilder.Entity<OrderDetail>()
                .HasKey(od => new { od.OrderId, od.IdDrink });

            modelBuilder.Entity<OrderDetail>()
        .HasKey(od => od.Id);

            modelBuilder.Entity<OrderDetail>()
                .Property(od => od.Id)
                .ValueGeneratedOnAdd(); // Xác nhận IDENTITY

            modelBuilder.Entity<FavoriteDrink>()
        .HasKey(f => new { f.IdUser, f.IdDrink });

            // Nếu bạn muốn mapping chính xác với bảng trong SQL đã tạo
            modelBuilder.Entity<FavoriteDrink>().ToTable("FavoriteDrinks");

            modelBuilder.Entity<JobRequirements>()
        .HasOne<Job>()
        .WithMany(j => j.requirements)
        .HasForeignKey(r => r.JobId)
        .OnDelete(DeleteBehavior.Cascade);
        }
    }
}