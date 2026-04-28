using backend_mycoffeedau.Data;
using backend_mycoffeedau.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

[Route("api/[controller]")]
[ApiController]
public class ActivityController : ControllerBase
{
    private readonly AppDbContext _context;
    public ActivityController(AppDbContext context) => _context = context;

    [HttpGet]
    public async Task<ActionResult<IEnumerable<Activity>>> GetAll()
        => await _context.Activities.OrderByDescending(a => a.DateCreate).ToListAsync();

    [HttpGet("{id}")]
    public async Task<ActionResult<Activity>> GetById(string id)
    {
        var activity = await _context.Activities.FindAsync(id);
        return activity == null ? NotFound() : activity;
    }

    [HttpPost]
    public async Task<ActionResult<Activity>> Create(Activity activity)
    {
        activity.DateCreate = DateTime.Now;
        _context.Activities.Add(activity);
        await _context.SaveChangesAsync();
        return CreatedAtAction(nameof(GetById), new { id = activity.Id }, activity);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Update(string id, Activity activity)
    {
        if (id != activity.Id) return BadRequest();
        _context.Entry(activity).State = EntityState.Modified;
        await _context.SaveChangesAsync();
        return NoContent();
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(string id)
    {
        var activity = await _context.Activities.FindAsync(id);
        if (activity == null) return NotFound();
        _context.Activities.Remove(activity);
        await _context.SaveChangesAsync();
        return NoContent();
    }
}