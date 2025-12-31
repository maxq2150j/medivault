using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace MediVault.Backend.Migrations
{
    /// <inheritdoc />
    public partial class AddDoctorIdToConsultations : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "DoctorId",
                table: "Consultations",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.CreateIndex(
                name: "IX_Consultations_DoctorId",
                table: "Consultations",
                column: "DoctorId");

            migrationBuilder.AddForeignKey(
                name: "FK_Consultations_Doctors_DoctorId",
                table: "Consultations",
                column: "DoctorId",
                principalTable: "Doctors",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Consultations_Doctors_DoctorId",
                table: "Consultations");

            migrationBuilder.DropIndex(
                name: "IX_Consultations_DoctorId",
                table: "Consultations");

            migrationBuilder.DropColumn(
                name: "DoctorId",
                table: "Consultations");
        }
    }
}
