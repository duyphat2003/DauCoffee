using backend_mycoffeedau.Data;
using backend_mycoffeedau.Model;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
namespace backend_mycoffeedau.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class FavoriteDrinkController : ControllerBase
    {
        private readonly AppDbContext _context;
        public FavoriteDrinkController(AppDbContext context) => _context = context;

        [HttpGet("{userId}")]
        public async Task<ActionResult<IEnumerable<FavoriteDrink>>> GetByUser(string userId)
        {
            return await _context.FavoriteDrinks.Where(f => f.IdUser == userId).ToListAsync();
        }

        [HttpPost]
        public async Task<IActionResult> AddFavorite(FavoriteDrink fav)
        {
            _context.FavoriteDrinks.Add(fav);
            await _context.SaveChangesAsync();
            return Ok();
        }

        [HttpDelete("{userId}/{drinkId}")]
        public async Task<IActionResult> Remove(string userId, string drinkId)
        {
            var fav = await _context.FavoriteDrinks
                .FirstOrDefaultAsync(f => f.IdUser == userId && f.IdDrink == drinkId);
            if (fav == null) return NotFound();
            _context.FavoriteDrinks.Remove(fav);
            await _context.SaveChangesAsync();
            return NoContent();
        }
    }
}