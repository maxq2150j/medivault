package com.medivault.dto;

import java.time.LocalDateTime;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor

public class PatientFileItemDTO {

    private Long id;
    private Long patientId;

    private Long doctorId;             
    private Long uploadedByHospitalId;   

    private String fileName;
    private String filePath;
    private String fileType;
    private Long fileSize;

    private LocalDateTime uploadedAt;
    private String description;
}