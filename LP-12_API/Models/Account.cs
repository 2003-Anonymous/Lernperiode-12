namespace LP_12_API.Models
{
    public class Account
    {
        public int Id { get; set; }
        public string Username { get; set; }
        public string Password { get; set; }
        public string Role { get; set; }
        public double Balance { get; set; } = 0;
    }
}
