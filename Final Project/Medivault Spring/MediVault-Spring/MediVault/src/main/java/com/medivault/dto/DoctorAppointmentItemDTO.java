package com.medivault.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class DoctorAppointmentItemDTO {

    private Long id;
    private Long patientId;
    private String patientName;
    private LocalDateTime appointmentDate;
    private String status;
    private String notes;
    private boolean paymentRequired;
    private BigDecimal paymentAmount;
    private boolean paymentCompleted;
}
