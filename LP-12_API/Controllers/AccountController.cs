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
        private static AccountDto ToDto(Account a) => new(a.Id, a.Username, a.Role, a.Balance);

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

        [HttpGet("{id}")]
        public async Task<ActionResult> GetAccount(int id)
        {
            var account = await _context.Accounts
                .FirstOrDefaultAsync(a => a.Id == id);

            if (account == null)
            {
                return NotFound();
            }

            return Ok(ToDto(account));
        }

        [HttpPost]
        public async Task<ActionResult> PostAccount(Account account)
        {
            account.Password = BCrypt.Net.BCrypt.HashPassword(account.Password);
            _context.Accounts.Add(account);
            await _context.SaveChangesAsync();
            return CreatedAtAction(nameof(GetAccount), new { id = account.Id }, account);

        }

        [HttpPut("{id}")]
        public async Task<ActionResult> PutAccount(int id, Account account)
        {
            if (id != account.Id)
            {
                return BadRequest();
            }

            account.Password = BCrypt.Net.BCrypt.HashPassword(account.Password);
            _context.Entry(account).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!_context.Accounts.Any(a => a.Id == id))
                {
                    return NotFound();
                }
                else
                {
                    throw;
                }
            }

            return NoContent();
        }

        [HttpDelete("{id}")]
        public async Task<ActionResult> DeleteAccount(int id)
        {
            var account = await _context.Accounts.FindAsync(id);
            if (account == null)
            {
                return NotFound();
            }

            _context.Accounts.Remove(account);
            await _context.SaveChangesAsync();

            return Ok(ToDto(account));
        }

        [HttpPost("login")]
        public async Task<ActionResult> Login([FromBody] LoginRequest request)
        {
            var account = await _context.Accounts
                .FirstOrDefaultAsync(a => a.Username == request.Username);

            if (account == null || !BCrypt.Net.BCrypt.Verify(request.Password, account.Password))
            {
                return Unauthorized();
            }

            return Ok(ToDto(account));
        }
    }
}