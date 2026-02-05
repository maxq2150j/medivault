package com.medivault.dto;

import com.fasterxml.jackson.annotation.JsonProperty;

import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class DoctorConsultationRequestDTO {

    @NotNull
    @JsonProperty("DoctorId")
    private Long doctorId;

    @NotNull
    @JsonProperty("PatientId")
    private Long patientId;

    @NotNull
    @JsonProperty("HospitalId")
    private Long hospitalId;

    @JsonProperty("Diagnosis")
    private String diagnosis;

    @JsonProperty("BP")
    private String bp;

    @JsonProperty("Sugar")
    private String sugar;

    @JsonProperty("Temperature")
    private String temperature;

    @JsonProperty("Medicines")
    private String medicines;
}
