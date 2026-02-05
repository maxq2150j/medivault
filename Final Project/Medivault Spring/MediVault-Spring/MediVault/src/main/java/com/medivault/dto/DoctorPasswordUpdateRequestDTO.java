package com.medivault.dto;

import com.fasterxml.jackson.annotation.JsonProperty;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class DoctorPasswordUpdateRequestDTO {

    @NotBlank(message = "Current password is required")
    @JsonProperty("CurrentPassword")
    private String currentPassword;

    @NotBlank(message = "New password is required")
    @JsonProperty("NewPassword")
    private String newPassword;
}
