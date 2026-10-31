using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace LP_12_API.Migrations
{
    /// <inheritdoc />
    public partial class HashPasswords : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.UpdateData(
                table: "Accounts",
                keyColumn: "Id",
                keyValue: 1,
                column: "Password",
                value: "$2a$11$R0BhPmNawBurV65kJ.ifcuplSmzBEhrOgbVw0tTy1fHSSkubuaaXe");

            migrationBuilder.UpdateData(
                table: "Accounts",
                keyColumn: "Id",
                keyValue: 2,
                column: "Password",
                value: "$2a$11$CUwp5Twv7sUpLYDSrdy2ceUJ/yBWE1CoUjhCA6DzXxtkU.e5LvG7S");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.UpdateData(
                table: "Accounts",
                keyColumn: "Id",
                keyValue: 1,
                column: "Password",
                value: "admin123");

            migrationBuilder.UpdateData(
                table: "Accounts",
                keyColumn: "Id",
                keyValue: 2,
                column: "Password",
                value: "user123");
        }
    }
}