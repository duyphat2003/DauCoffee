using backend_mycoffeedau.Data;
using backend_mycoffeedau.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

[Route("api/[controller]")]
[ApiController]
public class JobController : ControllerBase
{
    private readonly AppDbContext _context;
    public JobController(AppDbContext context) => _context = context;

    [HttpGet]
    public async Task<ActionResult<IEnumerable<Job>>> GetAll()
        => await _context.Jobs.Include(j => j.requirements).ToListAsync();

    [HttpGet("{id}")]
    public async Task<ActionResult<Job>> GetById(string id)
    {
        var job = await _context.Jobs.Include(j => j.requirements)
                                     .FirstOrDefaultAsync(j => j.Id == id);
        return job == null ? NotFound() : job;
    }

    [HttpPost]
    public async Task<ActionResult<Job>> Create(Job job)
    {
        _context.Jobs.Add(job);
        await _context.SaveChangesAsync();
        return CreatedAtAction(nameof(GetById), new { id = job.Id }, job);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Update(string id, Job job)
    {
        if (id != job.Id) return BadRequest();

        // Xóa các requirements cũ và thay bằng mới để tránh trùng lặp Id
        var existingJob = await _context.Jobs.Include(j => j.requirements)
                                             .FirstOrDefaultAsync(j => j.Id == id);
        if (existingJob == null) return NotFound();

        _context.Entry(existingJob).CurrentValues.SetValues(job);
        existingJob.requirements = job.requirements;

        await _context.SaveChangesAsync();
        return NoContent();
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(string id)
    {
        // 1. Tìm Job cùng với danh sách Requirements của nó
        var job = await _context.Jobs
            .Include(j => j.requirements)
            .FirstOrDefaultAsync(j => j.Id == id);

        if (job == null) return NotFound();

        // 2. Xóa tất cả Requirements liên quan trước
        if (job.requirements != null && job.requirements.Any())
        {
            _context.jobRequirements.RemoveRange(job.requirements);
        }

        // 3. Sau đó mới xóa Job
        _context.Jobs.Remove(job);

        // 4. Lưu thay đổi vào DB
        try
        {
            await _context.SaveChangesAsync();
        }
        catch (Exception ex)
        {
            return BadRequest("Lỗi khi xóa: " + ex.Message);
        }

        return NoContent();
    }
}