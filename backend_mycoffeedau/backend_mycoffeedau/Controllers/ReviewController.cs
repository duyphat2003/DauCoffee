using backend_mycoffeedau.Data;
using backend_mycoffeedau.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace backend_mycoffeedau.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ReviewController : ControllerBase
    {
        private readonly AppDbContext _context;
        public ReviewController(AppDbContext context) => _context = context;

        [HttpGet]
        public async Task<ActionResult<IEnumerable<Review>>> GetAll()
        {
            return await _context.Reviews.ToListAsync();
        }

        [HttpGet("drink/{drinkId}")]
        public async Task<ActionResult<IEnumerable<Review>>> GetByDrink(string drinkId)
        {
            return await _context.Reviews.Where(r => r.IdDrink == drinkId).ToListAsync();
        }

        [HttpPost]
        public async Task<ActionResult<Review>> Create(Review review)
        {
            review.DateReview = DateTime.Now;
            _context.Reviews.Add(review);
            await _context.SaveChangesAsync();
            return Ok(review);
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var review = await _context.Reviews.FindAsync(id);
            if (review == null) return NotFound();
            _context.Reviews.Remove(review);
            await _context.SaveChangesAsync();
            return NoContent();
        }
    }
}