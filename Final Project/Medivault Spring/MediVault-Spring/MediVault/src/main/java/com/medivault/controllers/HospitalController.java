package com.medivault.controllers;

import java.util.List;
import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.medivault.dto.MessageResponseDTO;
import com.medivault.dto.PatientFileItemDTO;
import com.medivault.dto.PatientProfileResponseDTO;
import com.medivault.entites.Hospital;
import com.medivault.entites.User;
import com.medivault.exceptions.InvalidRequestException;
import com.medivault.exceptions.ResourceNotFoundException;
import com.medivault.repository.HospitalRepository;
import com.medivault.repository.UserRepository;
import com.medivault.services.HospitalService;

import jakarta.validation.constraints.NotBlank;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/hospital")
@RequiredArgsConstructor
public class HospitalController {

    private final HospitalService hospitalService;
    private final UserRepository userRepository;
    private final HospitalRepository hospitalRepository;

    @GetMapping("/search-patient")
    public ResponseEntity<List<PatientProfileResponseDTO>> searchPatient(@RequestParam("query") String query) {
        List<PatientProfileResponseDTO> patients = hospitalService.searchPatients(query);
        return ResponseEntity.ok(patients);
    }

    @GetMapping("/patient-files/{patientId}")
    public ResponseEntity<List<PatientFileItemDTO>> getPatientFiles(@PathVariable Long patientId) {
        List<PatientFileItemDTO> files = hospitalService.getPatientFiles(patientId);
        return ResponseEntity.ok(files);
    }

    @PostMapping(value = "/upload-file", consumes = "multipart/form-data")
    public ResponseEntity<MessageResponseDTO> uploadFile(
            Authentication authentication,
            @RequestParam("file") MultipartFile file,
            @RequestParam("patientId") Long patientId,
            @RequestParam("fileType") @NotBlank String fileType) {

        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.status(401).build();
        }
        String username = authentication.getName();
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        Hospital hospital = hospitalRepository.findByUserId(user.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Hospital profile not found"));

        hospitalService.uploadPatientFile(patientId, hospital.getId(), fileType, file);
        return ResponseEntity.ok(new MessageResponseDTO("File uploaded successfully"));
    }

    @PutMapping("/doctors/{doctorId}/active")
    public ResponseEntity<MessageResponseDTO> updateDoctorActive(
            @PathVariable Long doctorId,
            @RequestBody Map<String, Boolean> body) {

        Boolean isActive = body.get("isActive");
        if (isActive == null) {
            throw new InvalidRequestException("isActive field is required");
        }

        hospitalService.updateDoctorActiveStatus(doctorId, isActive);

        String message = Boolean.TRUE.equals(isActive)
                ? "Doctor activated successfully"
                : "Doctor deactivated successfully";

        return ResponseEntity.ok(new MessageResponseDTO(message));
    }
}
