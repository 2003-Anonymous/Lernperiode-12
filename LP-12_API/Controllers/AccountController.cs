using System.Security.Claims;

using LP_12_API.Models;
using LP_12_API.Services;

using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Identity.Client.NativeInterop;

using Account = LP_12_API.Models.Account;

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


        // Einsatz (negativ) oder Gewinn (positiv) zum Guthaben addieren.
        // Die Spiellogik läuft im Frontend, die API speichert nur das Ergebnis.
        [Authorize]
        [HttpPost("me/balance")]
        public async Task<ActionResult> ChangeBalance([FromBody] BalanceChangeRequest request)
        {
            if (request.Amount == 0)
            {
                return BadRequest("Amount must not be 0.");
            }

            var id = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
            var account = await _context.Accounts.FindAsync(id);

            if (account == null)
            {
                await HttpContext.SignOutAsync(CookieAuthenticationDefaults.AuthenticationScheme);
                return Unauthorized();
            }

            var newBalance = Math.Round(account.Balance + request.Amount, 2);
            if (newBalance < 0)
            {
                return BadRequest("Insufficient balance.");
            }

            account.Balance = newBalance;
            await _context.SaveChangesAsync();

            return Ok(ToDto(account));
        }

        [Authorize]
        [HttpPost("me/redeem")]
        public async Task<ActionResult> Redeem([FromBody] RedeemRequest request)
        {
            var id = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
            var text = request.Code.Trim().ToUpperInvariant();

            var code = await _context.RedeemCodes.FirstOrDefaultAsync(c => c.Code == text);

            var invalid = code == null
                || !code.IsActive
                || code.ExpiresAt != null && code.ExpiresAt <= DateTime.UtcNow
                || code.MaxUses != null && code.MaxUses <= code.UsedCount;

            if (invalid)
            {
                return BadRequest("Code ungültig oder abgelaufen!");
            }

            var alreadyRedeemed = await _context.CodeRedemptions
                .AnyAsync(r => r.AccountId == id && r.RedeemCodeId == code!.Id);

            if (alreadyRedeemed)
            {
                return BadRequest("Code bereits eingelöst!");
            }

            await using var tx = await _context.Database.BeginTransactionAsync();

            var counted = await _context.RedeemCodes
                .Where(c => c.Id == code!.Id && (c.MaxUses == null || c.UsedCount < code.MaxUses))
                .ExecuteUpdateAsync(s => s.SetProperty(c => c.UsedCount, c => c.UsedCount + 1));

            if (counted == 0)
            {
                return BadRequest("Code ungültig oder abgelaufen");
            }
            _context.CodeRedemptions.Add(new CodeRedemption
            {
                AccountId = id,
                RedeemCodeId = code!.Id,
                RedeemedAt = DateTime.UtcNow
            });

            await _context.SaveChangesAsync();

            await _context.Accounts
                .Where(a => a.Id == id)
                .ExecuteUpdateAsync(s => s.SetProperty(a => a.Balance, a => a.Balance + code.Amount));

            await tx.CommitAsync();

            var account = await _context.Accounts.AsNoTracking().FirstAsync(a => a.Id == id);
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