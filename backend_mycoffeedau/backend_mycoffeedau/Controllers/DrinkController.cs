using backend_mycoffeedau.Data;
using backend_mycoffeedau.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace backend_mycoffeedau.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class DrinkController : ControllerBase
    {
        private readonly AppDbContext _context;
        public DrinkController(AppDbContext context) => _context = context;

        [HttpGet]
        public async Task<ActionResult<IEnumerable<Drink>>> GetAll() => await _context.Drinks.ToListAsync();

        [HttpGet("{id}")]
        public async Task<ActionResult<Drink>> GetById(string id)
        {
            var drink = await _context.Drinks.FindAsync(id);
            return drink == null ? NotFound() : drink;
        }

        [HttpPost]
        public async Task<ActionResult<Drink>> Create(Drink drink)
        {
            _context.Drinks.Add(drink);
            await _context.SaveChangesAsync();
            return CreatedAtAction(nameof(GetById), new { id = drink.Id }, drink);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(string id, Drink drink)
        {
            if (id != drink.Id) return BadRequest();
            _context.Entry(drink).State = EntityState.Modified;
            await _context.SaveChangesAsync();
            return NoContent();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(string id)
        {
            var drink = await _context.Drinks.FindAsync(id);
            if (drink == null) return NotFound();
            _context.Drinks.Remove(drink);
            await _context.SaveChangesAsync();
            return NoContent();
        }
    }
}