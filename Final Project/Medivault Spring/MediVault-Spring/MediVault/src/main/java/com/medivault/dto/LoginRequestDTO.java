package com.medivault.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor

public class LoginRequestDTO {
	
	@NotBlank(message = "Username is required")
	@Pattern(
	    regexp = "^[A-Za-z][A-Za-z0-9]*$",
	    message = "Username must start with a letter and contain only letters and digits"
	)
	private String username;
	
	@NotBlank(message = "Password is required")
	@Pattern(
	    regexp = "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]{8,}$",
	    message = "Password must be at least 8 characters long and contain uppercase, lowercase, number, and special character"
	)
	private String password;
}
