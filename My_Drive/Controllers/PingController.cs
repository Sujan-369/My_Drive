using Microsoft.AspNetCore.Mvc;

namespace My_Drive.Controllers;

[ApiController]
[Route("api/ping")]
public class PingController : ControllerBase
{
    [HttpGet]
    public IActionResult Get() => Ok(new { status = "ok", time = DateTime.UtcNow });
}