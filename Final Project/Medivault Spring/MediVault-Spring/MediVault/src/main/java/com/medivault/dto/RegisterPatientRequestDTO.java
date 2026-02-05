package com.medivault.dto;

import com.medivault.enums.Gender;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class RegisterPatientRequestDTO {
	
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
	
	@NotBlank(message = "Name is required")
	@Pattern(
	    regexp = "^[A-Za-z ]+$",
	    message = "Name can contain only letters and spaces"
	)
	private String name;
	
	@NotNull(message = "Age is required")
	@Min(value = 0, message = "Age must be between 0 and 120")
	@Max(value = 120, message = "Age must be between 0 and 120")
	private Integer age;
	
	@NotNull(message = "Gender is required")
	private Gender gender;
	
	@NotBlank(message = "Phone number is required")
	@Pattern(
		regexp = "^[6-9][0-9]{9}$",
		message = "Invalid Indian mobile number"
	)
	private String phoneNumber;
	

}
