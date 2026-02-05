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

public class ConsultationItemDTO {
	
    private Long id;
    private Long patientId;
    private Long doctorId;
    private Long hospitalId;
    private LocalDateTime date;

    private String diagnosis;
    private String bp;
    private String sugar;
    private String temperature;
    private String medicines;

    private String pdfPath;
    
}