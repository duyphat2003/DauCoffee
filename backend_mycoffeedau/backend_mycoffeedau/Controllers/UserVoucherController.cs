using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using backend_mycoffeedau.Model;
using backend_mycoffeedau.Data; // Thay bằng namespace DbContext của bạn

namespace backend_mycoffeedau.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class UserVoucherController : ControllerBase
    {
        private readonly AppDbContext _context;

        public UserVoucherController(AppDbContext context)
        {
            _context = context;
        }

        // ================= ADMIN CRUD =================

        [HttpGet("admin/all")]
        public async Task<ActionResult<IEnumerable<Voucher>>> GetVouchersAdmin()
        {
            return await _context.Vouchers.ToListAsync();
        }

        [HttpPost("admin/add")]
        public async Task<IActionResult> PostVoucher(Voucher voucher)
        {
            _context.Vouchers.Add(voucher);
            await _context.SaveChangesAsync();
            return Ok(new { message = "Thêm voucher thành công!" });
        }

        [HttpPut("admin/update/{id}")]
        public async Task<IActionResult> PutVoucher(string id, Voucher voucher)
        {
            if (id != voucher.Id) return BadRequest();
            _context.Entry(voucher).State = EntityState.Modified;
            await _context.SaveChangesAsync();
            return NoContent();
        }

        [HttpDelete("admin/delete/{id}")]
        public async Task<IActionResult> DeleteVoucher(string id)
        {
            var voucher = await _context.Vouchers.FindAsync(id);
            if (voucher == null) return NotFound();
            _context.Vouchers.Remove(voucher);
            await _context.SaveChangesAsync();
            return Ok(new { message = "Đã xóa voucher" });
        }

        // ================= USER PROFILE / SHOP =================

        // 1. Lấy danh sách voucher có sẵn trong shop để đổi
        [HttpGet("shop/list")]
        public async Task<ActionResult<IEnumerable<Voucher>>> GetVoucherShop()
        {
            return await _context.Vouchers.OrderBy(v => v.Point).ToListAsync();
        }

        // 2. Lấy danh sách Voucher mà User ĐANG SỞ HỮU (đã đổi)
        [HttpGet("my-vouchers/{userId}")]
        public async Task<IActionResult> GetMyVouchers(string userId)
        {
            var myVouchers = await _context.UserVouchers
                .Where(uv => uv.IdUser == userId)
                .Join(_context.Vouchers,
                      uv => uv.IdVoucher,
                      v => v.Id,
                      (uv, v) => new { v.Content, v.PointRequirement, uv.RedeemedDate, uv.IsUsed })
                .ToListAsync();
            return Ok(myVouchers);
        }

        // 3. Hành động ĐỔI ĐIỂM lấy Voucher
        [HttpPost("redeem")]
        public async Task<IActionResult> RedeemVoucher(string userId, string voucherId)
        {
            var user = await _context.Users.FindAsync(userId);
            var voucher = await _context.Vouchers.FindAsync(voucherId);

            if (user == null || voucher == null) return NotFound("Thông tin không hợp lệ");

            // Kiểm tra điểm tích lũy của User từ bảng Users
            if (user.Points < voucher.Point)
            {
                return BadRequest("Bạn không đủ điểm tích lũy để đổi voucher này!");
            }

            // Thực hiện trừ điểm
            user.Points -= voucher.Point;

            // Lưu vào lịch sử sở hữu
            var newUserVoucher = new UserVoucher
            {
                IdUser = userId,
                IdVoucher = voucherId,
                RedeemedDate = DateTime.Now,
                IsUsed = false
            };

            _context.UserVouchers.Add(newUserVoucher);
            await _context.SaveChangesAsync();

            return Ok(new
            {
                message = "Đổi voucher thành công!",
                remainingPoints = user.Points
            });
        }
    }
}