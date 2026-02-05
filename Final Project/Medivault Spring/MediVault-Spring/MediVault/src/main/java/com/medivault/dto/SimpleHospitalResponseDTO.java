package com.medivault.dto;

import com.fasterxml.jackson.annotation.JsonProperty;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class SimpleHospitalResponseDTO {

	private Long id;
	private String name;
	private String address;
	private String username;
	private String email;
	@JsonProperty("isActive")
	private boolean isActive;
}
