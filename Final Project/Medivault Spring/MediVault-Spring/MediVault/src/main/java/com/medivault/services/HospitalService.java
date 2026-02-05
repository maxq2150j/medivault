package com.medivault.services;

import java.util.List;

import org.springframework.web.multipart.MultipartFile;

import com.medivault.dto.PatientFileItemDTO;
import com.medivault.dto.PatientProfileResponseDTO;

public interface HospitalService {

    List<PatientProfileResponseDTO> searchPatients(String query);

	PatientFileItemDTO uploadPatientFile(Long patientId, Long hospitalId, String fileType, MultipartFile file);

    void updateDoctorActiveStatus(Long doctorId, boolean isActive);

    List<PatientFileItemDTO> getPatientFiles(Long patientId);
}
