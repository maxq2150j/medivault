package com.medivault.dto;

import com.medivault.enums.Gender;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor

public class PatientProfileResponseDTO {
	
	private Long id;
    private Long userId;

    private String name;
    private Integer age;
    private Gender gender;
    private String phoneNumber;

    private String bloodGroup;
    private String allergies;
    private String familyHistory;

    private String username;
    private String email;

}
