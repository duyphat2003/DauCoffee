using backend_mycoffeedau.Data;
using backend_mycoffeedau.Models;
using Microsoft.AspNetCore.Identity.Data;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace backend_mycoffeedau.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class UserController : ControllerBase
    {
        private readonly AppDbContext _context;
        public UserController(AppDbContext context) => _context = context;

        [HttpPost("login")]
        public async Task<ActionResult<User>> Login([FromBody] LoginRequest request)
        {
            // Kiểm tra đúng email và mật khẩu trong database
            var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == request.Email && u.Password == request.Password);
            if (user == null) return Unauthorized("Tài khoản hoặc mật khẩu không chính xác!");
            return Ok(user);
        }

        [HttpPost("register")]
        public async Task<ActionResult<User>> Register([FromBody] User user)
        {
            if (await _context.Users.AnyAsync(u => u.Email == user.Email))
                return BadRequest("Email này đã được đăng ký bởi lữ khách khác!");

            // Gán các thông tin mặc định theo yêu cầu
            user.Id = Guid.NewGuid().ToString();
            user.Rank = "Tập Sự";
            user.Points = 0;
            user.Avatar = "https://i.pravatar.cc/150?u=" + user.Id;
            user.Phone = ""; user.Address = ""; // Mặc định trống

            _context.Users.Add(user);
            await _context.SaveChangesAsync();
            return Ok(user);
        }

        [HttpPost("forgot-password")]
        public async Task<IActionResult> ForgotPassword([FromBody] ForgotPasswordRequest request)
        {
            var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == request.Email);
            if (user == null) return NotFound("Email này chưa từng ghé thăm quán!");

            // Tạo mật khẩu ngẫu nhiên 8 ký tự
            string newPass = Guid.NewGuid().ToString().Substring(0, 8).ToUpper();
            user.Password = newPass;

            await _context.SaveChangesAsync();
            // Giả lập gửi mail (thực tế sẽ dùng SmtpClient tại đây)
            return Ok($"Hệ thống đã gửi mật khẩu mới: {newPass} tới email {request.Email}");
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<User>>> GetAll()
        {
            return await _context.Users.ToListAsync();
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<User>> GetById(string id)
        {
            var user = await _context.Users.FindAsync(id);
            if (user == null) return NotFound();
            return user;
        }

        [HttpGet("email/{email}")]
        public async Task<ActionResult<User>> GetByEmail(string email)
        {
            // Tìm người dùng có email trùng khớp (không phân biệt hoa thường)
            var user = await _context.Users.FirstOrDefaultAsync(u => u.Email.ToLower() == email.ToLower());

            if (user == null)
            {
                return NotFound($"Không tìm thấy lữ khách có email: {email}");
            }

            return Ok(user);
        }

        [HttpPost]
        public async Task<ActionResult<User>> Create(User user)
        {
            _context.Users.Add(user);
            await _context.SaveChangesAsync();
            return CreatedAtAction(nameof(GetById), new { id = user.Id }, user);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(string id, User user)
        {
            if (id != user.Id) return BadRequest();
            _context.Entry(user).State = EntityState.Modified;
            await _context.SaveChangesAsync();
            return NoContent();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(string id)
        {
            var user = await _context.Users.FindAsync(id);
            if (user == null) return NotFound();
            _context.Users.Remove(user);
            await _context.SaveChangesAsync();
            return NoContent();
        }
    }
}

public class LoginRequest { public string Email { get; set; } public string Password { get; set; } }
public class ForgotPasswordRequest { public string Email { get; set; } }