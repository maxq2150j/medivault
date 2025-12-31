using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace MediVault.Backend.Migrations
{
    /// <inheritdoc />
    public partial class AddPaymentSupport : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<bool>(
                name: "PaymentRequired",
                table: "Appointments",
                type: "tinyint(1)",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<decimal>(
                name: "PaymentAmount",
                table: "Appointments",
                type: "decimal(18,2)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "PaymentStatus",
                table: "Appointments",
                type: "longtext",
                nullable: false,
                defaultValue: "NotRequested");

            migrationBuilder.CreateTable(
                name: "Payments",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("MySQL:AutoIncrement", true),
                    AppointmentId = table.Column<int>(type: "int", nullable: false),
                    Amount = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    PaymentStatus = table.Column<string>(type: "longtext", nullable: false),
                    RazorpayOrderId = table.Column<string>(type: "longtext", nullable: true),
                    RazorpayPaymentId = table.Column<string>(type: "longtext", nullable: true),
                    RazorpaySignature = table.Column<string>(type: "longtext", nullable: true),
                    RequestedAt = table.Column<DateTime>(type: "datetime(6)", nullable: false),
                    CompletedAt = table.Column<DateTime>(type: "datetime(6)", nullable: true),
                    FailureReason = table.Column<string>(type: "longtext", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Payments", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Payments_Appointments_AppointmentId",
                        column: x => x.AppointmentId,
                        principalTable: "Appointments",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Payments_AppointmentId",
                table: "Payments",
                column: "AppointmentId",
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "Payments");

            migrationBuilder.DropColumn(
                name: "PaymentRequired",
                table: "Appointments");

            migrationBuilder.DropColumn(
                name: "PaymentAmount",
                table: "Appointments");

            migrationBuilder.DropColumn(
                name: "PaymentStatus",
                table: "Appointments");
        }
    }
}
