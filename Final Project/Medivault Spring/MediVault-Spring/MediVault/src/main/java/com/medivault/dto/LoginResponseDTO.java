package com.medivault.dto;

import com.medivault.enums.Role;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class LoginResponseDTO {
	
	private Long userId;
	private String name;
	private String message;
	private Role role;
	
	private Long specificId;
	private String token;
	
}
