using LP_12_API.Models;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace LP_12_API.Controllers
{
    [ApiController]
    [Route("[controller]")]
    public class AccountController : ControllerBase
    {
        private readonly CasinoContext _context;

        public AccountController(CasinoContext context)
        {
            _context = context;
        }


        [HttpGet]
        public async Task<ActionResult> GetAllAccounts()
        {
            var accounts = await _context.Accounts
                .ToListAsync();
            return Ok(accounts);
        }
    }
}
