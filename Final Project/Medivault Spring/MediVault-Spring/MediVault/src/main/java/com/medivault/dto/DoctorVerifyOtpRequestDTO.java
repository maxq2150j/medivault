package com.medivault.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class DoctorVerifyOtpRequestDTO {

    @NotNull
    private Long accessRequestId;

    @NotBlank
    private String otp;
}
