using backend_mycoffeedau.Data;
using backend_mycoffeedau.Model;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace backend_mycoffeedau.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class VoucherController : ControllerBase
    {
        private readonly AppDbContext _context; // Giả sử bạn dùng Entity Framework

        public VoucherController(AppDbContext context) => _context = context;

        // Lấy danh sách tất cả voucher
        [HttpGet]
        public async Task<IActionResult> GetAll() => Ok(await _context.Vouchers.ToListAsync());

        [HttpPost("redeem/{voucherId}")]
        public async Task<IActionResult> RedeemVoucher(string userId, string voucherId)
        {
            var user = await _context.Users.FindAsync(userId);
            var voucher = await _context.Vouchers.FindAsync(voucherId);

            if (user.Points < voucher.Point)
                return BadRequest("Bạn không đủ điểm tích lũy!");

            // Trừ điểm user
            user.Points -= voucher.Point;

            // Lưu vào bảng trung gian (Cần tạo thêm bảng UserVouchers như đã gợi ý)
            var userVoucher = new UserVoucher { IdUser = userId, IdVoucher = voucherId, RedeemedDate = DateTime.Now };
            _context.UserVouchers.Add(userVoucher);

            await _context.SaveChangesAsync();
            return Ok("Đổi voucher thành công!");
        }

        // Thêm voucher mới
        [HttpPost]
        public async Task<IActionResult> Create(Voucher voucher)
        {
            _context.Vouchers.Add(voucher);
            await _context.SaveChangesAsync();
            return Ok(voucher);
        }

        // Cập nhật voucher
        [HttpPut("{id}")]
        public async Task<IActionResult> Update(string id, Voucher voucher)
        {
            var item = await _context.Vouchers.FindAsync(id);
            if (item == null) return NotFound();
            item.Content = voucher.Content;
            item.Point = voucher.Point;
            item.PointRequirement = voucher.PointRequirement;
            await _context.SaveChangesAsync();
            return Ok(item);
        }

        // Xóa voucher
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(string id)
        {
            var item = await _context.Vouchers.FindAsync(id);
            if (item == null) return NotFound();
            _context.Vouchers.Remove(item);
            await _context.SaveChangesAsync();
            return Ok();
        }
    }
}
