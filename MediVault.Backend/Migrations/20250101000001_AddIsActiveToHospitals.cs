using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace MediVault.Backend.Migrations
{
    /// <inheritdoc />
    public partial class AddIsActiveToHospitals : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<bool>(
                name: "IsActive",
                table: "Hospitals",
                type: "INTEGER",
                nullable: false,
                defaultValue: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "IsActive",
                table: "Hospitals");
        }
    }
}
