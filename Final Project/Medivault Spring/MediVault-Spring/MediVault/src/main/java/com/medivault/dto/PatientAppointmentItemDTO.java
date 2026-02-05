package com.medivault.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class PatientAppointmentItemDTO {

	private Long id;
	private Long doctorId;
	private String doctorName;
	private Long hospitalId;
	private String hospitalName;
	private LocalDateTime appointmentDate;
	private String status;
	private String notes;
	private boolean paymentRequired;
	private BigDecimal paymentAmount;
	private String paymentStatus;
}
