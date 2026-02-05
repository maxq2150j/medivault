package com.medivault.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class RegisterDoctorRequestDTO {
	@NotBlank(message = "Username is required")
    @Pattern(
        regexp = "^[A-Za-z][A-Za-z0-9]*$",
        message = "Username must start with a letter and contain only letters and digits"
    )
    private String username;

    @Pattern(
        regexp = "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]{8,}$",
        message = "Password must be at least 8 characters long and contain uppercase, lowercase, number, and special character"
    )
    private String password;

    @NotBlank(message = "Email is required")
    @Email(message = "Email format is invalid")
    @Pattern(
        regexp = ".*@(gmail\\.com|yahoo\\.in|outlook\\.com)$",
        message = "Email domain is not allowed"
    )
    private String email;

    @NotBlank(message = "Doctor name is required")
    @Pattern(
        regexp = "^[A-Za-z ]+$",
        message = "Doctor name can contain only letters and spaces"
    )
    private String name;

    @NotBlank(message = "Specialization is required")
    @Pattern(
    	regexp = "^[A-Za-z\\. ]+$",
    	message = "Specialization can contain only letters, spaces, and periods (e.g., MBBS, M.Phil, Ph.D)"
    )
    private String specialization;

    @NotBlank(message = "License number is required")
    @Pattern(
        regexp = "^[A-Za-z0-9-]+$",
        message = "License number can contain only letters, digits, and hyphens"
    )
    private String licenseNumber;

    @NotBlank(message = "Phone number is required")
    @Pattern(
        regexp = "^[6-9][0-9]{9}$",
        message = "Invalid Indian mobile number"
    )
    private String phoneNumber;

    @NotNull(message = "Hospital ID is required")
    private Long hospitalId;
}
