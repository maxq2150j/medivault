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
public class PatientRecordItemDTO {

    private Long id;
    private String hospitalName;
    private String doctorName;
    private LocalDateTime date;
    private String pdfPath;

    private String diagnosis;
    private String medicines;
}
