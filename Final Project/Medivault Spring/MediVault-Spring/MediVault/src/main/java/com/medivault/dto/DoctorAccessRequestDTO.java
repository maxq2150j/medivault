package com.medivault.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class DoctorAccessRequestDTO {

    @NotNull
    private Long doctorId;

    @NotNull
    private Long patientId;
}
