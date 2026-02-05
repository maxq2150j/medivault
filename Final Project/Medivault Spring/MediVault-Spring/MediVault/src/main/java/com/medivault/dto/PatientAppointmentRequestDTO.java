package com.medivault.dto;

import java.time.Instant;

import com.fasterxml.jackson.annotation.JsonProperty;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class PatientAppointmentRequestDTO {

	@JsonProperty("HospitalId")
	private Long hospitalId;

	@JsonProperty("DoctorId")
	private Long doctorId;

	// Frontend sends JavaScript Date (ISO string); map as Instant
	@JsonProperty("AppointmentDate")
	private Instant appointmentDate;

	@JsonProperty("Notes")
	private String notes;
}
