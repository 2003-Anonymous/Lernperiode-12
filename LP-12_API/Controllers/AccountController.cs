using System.Security.Claims;

using LP_12_API.Models;
using LP_12_API.Services;

using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace LP_12_API.Controllers
{
    [ApiController]
    [Route("[controller]")]
    public class AccountController : ControllerBase
    {
        private const double StartBalance = 1000;
        private readonly CasinoContext _context;

        public AccountController(CasinoContext context)
        {
            _context = context;
        }

        private static AccountDto ToDto(Account a) => new(a.Id, a.Username, a.Role, a.Balance);




        //Alle
        [HttpPost("register")]
        public async Task<ActionResult> Register([FromBody] RegisterRequest request)
        {
            if (await _context.Accounts.AnyAsync(a => a.Username == request.Username))
            {
                return Conflict("Username already exists.");
            }

            var account = new Account
            {
                Username = request.Username,
                Password = Passwords.Hash(request.Password),
                Role = "User",
                Balance = StartBalance
            };

            _context.Accounts.Add(account);
            await _context.SaveChangesAsync();

            await SignInAsync(account);
            return Created("/Account/me", ToDto(account));
        }


        [HttpPost("login")]
        public async Task<ActionResult> Login([FromBody] LoginRequest request)
        {
            var account = await _context.Accounts
                .FirstOrDefaultAsync(a => a.Username == request.Username);

            if (account == null || !Passwords.Verify(request.Password, account.Password))
            {
                return Unauthorized("Invalid username or password.");
            }

            await SignInAsync(account);
            return Ok(ToDto(account));
        }

        //Nur angemeldete Benutzer

        [Authorize]
        [HttpPost("logout")]
        public async Task<ActionResult> Logout()
        {
            await HttpContext.SignOutAsync(CookieAuthenticationDefaults.AuthenticationScheme);
            return NoContent();
        }

        [Authorize]
        [HttpGet("me")]
        public async Task<ActionResult> Me()
        {
            var id = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
            var account = await _context.Accounts.FindAsync(id);

            if (account == null)
            {
                await HttpContext.SignOutAsync(CookieAuthenticationDefaults.AuthenticationScheme);
                return Unauthorized();
            }

            return Ok(ToDto(account));
        }


        //Nur Admins

        [Authorize(Roles = "Admin")]
        [HttpGet]
        public async Task<ActionResult> GetAllAccounts()
        {
            var accounts = await _context.Accounts.ToListAsync();
            return Ok(accounts.Select(ToDto));
        }

        [Authorize(Roles = "Admin")]
        [HttpGet("{id:int}")]
        public async Task<ActionResult> GetAccount(int id)
        {
            var account = await _context.Accounts.FindAsync(id);

            if (account == null)
            {
                return NotFound();
            }

            return Ok(ToDto(account));
        }

        [Authorize(Roles = "Admin")]
        [HttpDelete("{id:int}")]
        public async Task<ActionResult> DeleteAccount(int id)
        {
            var account = await _context.Accounts.FindAsync(id);
            if (account == null)
            {
                return NotFound();
            }

            _context.Accounts.Remove(account);
            await _context.SaveChangesAsync();

            return NoContent();
        }



        private async Task SignInAsync(Account account)
        {
            var claims = new List<Claim>
            {
                new(ClaimTypes.NameIdentifier, account.Id.ToString()),
                new(ClaimTypes.Name, account.Username),
                new(ClaimTypes.Role, account.Role)
            };

            var identity = new ClaimsIdentity(claims, CookieAuthenticationDefaults.AuthenticationScheme);
            await HttpContext.SignInAsync(
                CookieAuthenticationDefaults.AuthenticationScheme,
                new ClaimsPrincipal(identity));
        }


    }
}