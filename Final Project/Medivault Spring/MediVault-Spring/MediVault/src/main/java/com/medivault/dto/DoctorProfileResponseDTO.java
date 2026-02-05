package com.medivault.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor

public class DoctorProfileResponseDTO {

    private Long id;
    private Long userId;
    private Long hospitalId;

    private String name;
    private String specialization;
    private String licenseNumber;
    private String phoneNumber;

    private String profilePicture;

    private boolean isActive;

    private String email;
    private String username;
    
}