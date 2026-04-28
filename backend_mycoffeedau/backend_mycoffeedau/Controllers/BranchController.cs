using backend_mycoffeedau.Data;
using backend_mycoffeedau.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

[Route("api/[controller]")]
[ApiController]
public class BranchController : ControllerBase
{
    private readonly AppDbContext _context;
    public BranchController(AppDbContext context) => _context = context;

    [HttpGet]
    public async Task<ActionResult<IEnumerable<Branch>>> GetAll() => await _context.Branches.ToListAsync();

    [HttpGet("{id}")]
    public async Task<ActionResult<Branch>> GetById(int id)
    {
        var branch = await _context.Branches.FindAsync(id);
        return branch == null ? NotFound() : branch;
    }

    [HttpPost]
    public async Task<ActionResult<Branch>> Create(Branch branch)
    {
        _context.Branches.Add(branch);
        await _context.SaveChangesAsync();
        return CreatedAtAction(nameof(GetById), new { id = branch.Id }, branch);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Update(int id, Branch branch)
    {
        if (id != branch.Id) return BadRequest();
        _context.Entry(branch).State = EntityState.Modified;
        await _context.SaveChangesAsync();
        return NoContent();
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        var branch = await _context.Branches.FindAsync(id);
        if (branch == null) return NotFound();
        _context.Branches.Remove(branch);
        await _context.SaveChangesAsync();
        return NoContent();
    }
}