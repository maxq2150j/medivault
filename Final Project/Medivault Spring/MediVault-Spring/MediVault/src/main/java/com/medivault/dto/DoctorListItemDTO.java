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

public class DoctorListItemDTO {
	
    private Long id;
    private String name;
    private String specialization;
    private String licenseNumber;
    private String phoneNumber;

    @JsonProperty("isActive")
    private boolean isActive;

    private Long hospitalId;

    private String username;
    private String email;
}