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

public class RecentVisitDTO {
	
    private LocalDateTime date;
    private String hospitalName;
    private String patientName;
    
}