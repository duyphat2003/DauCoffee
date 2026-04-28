using backend_mycoffeedau.Data;
using backend_mycoffeedau.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace backend_mycoffeedau.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class OrderController : ControllerBase
    {
        private readonly AppDbContext _context;
        public OrderController(AppDbContext context) => _context = context;

        [HttpGet]
        public async Task<ActionResult<IEnumerable<Order>>> GetAll()
            => await _context.Orders.Include(o => o.Items).ToListAsync();

        [HttpGet("{id}")]
        public async Task<ActionResult<Order>> GetById(string id)
        {
            var order = await _context.Orders.Include(o => o.Items)
                                             .FirstOrDefaultAsync(o => o.Id == id);
            if (order == null) return NotFound();
            return order;
        }

        [HttpGet("user/{userId}")]
        public async Task<ActionResult<IEnumerable<Order>>> GetByUserId(string userId)
        {
            var orders = await _context.Orders
                .Include(o => o.Items)
                .Where(o => o.IdUser == userId)
                .ToListAsync();

            return Ok(orders);
        }

        [HttpPost]
        public async Task<ActionResult<Order>> Create(Order order)
        {
            // Đảm bảo Id của mỗi OrderDetail = 0 để SQL IDENTITY tự tăng
            if (order.Items != null)
                foreach (var item in order.Items)
                {
                    item.Id = 0;
                    item.OrderId = order.Id;
                }

            _context.Orders.Add(order);
            await _context.SaveChangesAsync();
            return CreatedAtAction(nameof(GetById), new { id = order.Id }, order);
        }

        // File: Controllers/OrderController.cs
        [HttpPut("{id}")]
        public async Task<IActionResult> Update(string id, Order order)
        {
            if (id != order.Id) return BadRequest("ID không khớp.");

            var existingOrder = await _context.Orders
                .Include(o => o.Items)
                .FirstOrDefaultAsync(o => o.Id == id);

            if (existingOrder == null) return NotFound();

            // 1. Cập nhật thông tin chung của đơn hàng
            existingOrder.IdUser = order.IdUser;
            existingOrder.Date = order.Date;
            existingOrder.Total = order.Total;
            existingOrder.Status = order.Status;

            // 2. Xóa các chi tiết món cũ trong database
            if (existingOrder.Items != null && existingOrder.Items.Any())
            {
                _context.OrderDetails.RemoveRange(existingOrder.Items);
            }

            // 3. Thêm các chi tiết món mới
            if (order.Items != null)
            {
                foreach (var item in order.Items)
                {
                    // Tạo instance mới hoàn toàn, KHÔNG GÁN Id
                    var newItem = new OrderDetail
                    {
                        OrderId = id,
                        IdDrink = item.IdDrink,
                        Name = item.Name,
                        Quantity = item.Quantity,
                        PriceAtPurchase = item.PriceAtPurchase
                    };
                    _context.OrderDetails.Add(newItem);
                }
            }

            try
            {
                await _context.SaveChangesAsync();
                return NoContent();
            }
            catch (Exception ex)
            {
                return BadRequest("Lỗi lưu DB: " + (ex.InnerException?.Message ?? ex.Message));
            }
        }

        [HttpPatch("{id}/status")]
        public async Task<IActionResult> UpdateStatus(string id, [FromBody] string status)
        {
            var order = await _context.Orders.FindAsync(id);
            if (order == null) return NotFound();
            order.Status = status;
            await _context.SaveChangesAsync();
            return NoContent();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(string id)
        {
            var order = await _context.Orders.Include(o => o.Items)
                                             .FirstOrDefaultAsync(o => o.Id == id);
            if (order == null) return NotFound();
            _context.OrderDetails.RemoveRange(order.Items);
            _context.Orders.Remove(order);
            await _context.SaveChangesAsync();
            return NoContent();
        }
    }
}