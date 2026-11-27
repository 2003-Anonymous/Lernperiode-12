namespace LP_12_API.Models;

public class RedeemCode
{
    public int Id { get; set; }
    public string Code { get; set; }
    public double Amount { get; set; }
    public int? MaxUses { get; set; }
    public int UsedCount { get; set; }
    public DateTime? ExpiresAt { get; set; }
    public bool IsActive { get; set; }
}