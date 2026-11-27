using Microsoft.Identity.Client;

namespace LP_12_API.Models;

public class CodeRedemption
{
    public int Id { get; set; }
    public int AccountId { get; set; }
    public int RedeemCodeId { get; set; }
    public DateTime RedeemedAt { get; set; }
}