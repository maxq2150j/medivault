package com.medivault.services;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.time.LocalDateTime;
import java.util.List;

import org.modelmapper.ModelMapper;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import com.medivault.dto.PatientFileItemDTO;
import com.medivault.dto.PatientProfileResponseDTO;
import com.medivault.entites.Doctor;
import com.medivault.entites.Hospital;
import com.medivault.entites.Patient;
import com.medivault.entites.PatientFile;
import com.medivault.exceptions.InvalidRequestException;
import com.medivault.exceptions.ResourceNotFoundException;
import com.medivault.repository.AppointmentRepository;
import com.medivault.repository.DoctorRepository;
import com.medivault.repository.HospitalRepository;
import com.medivault.repository.PatientFileRepository;
import com.medivault.repository.PatientRepository;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;

@Service
@Transactional
@RequiredArgsConstructor
public class HospitalServiceImpl implements HospitalService {

    private final PatientRepository patientRepository;
    private final PatientFileRepository patientFileRepository;
    private final DoctorRepository doctorRepository;
    private final HospitalRepository hospitalRepository;
    private final AppointmentRepository appointmentRepository;
    private final ModelMapper mapper;

    @Override
    public List<PatientProfileResponseDTO> searchPatients(String query) {
        if (query == null || query.isBlank()) {
            return List.of();
        }

        List<Patient> patients = patientRepository
                .findByNameContainingIgnoreCaseOrPhonenumberContaining(query, query);

        return patients.stream().map(p -> {
            PatientProfileResponseDTO dto = mapper.map(p, PatientProfileResponseDTO.class);
            dto.setPhoneNumber(p.getPhonenumber());
            return dto;
        }).toList();
    }

    @Override
    public PatientFileItemDTO uploadPatientFile(Long patientId, Long hospitalId, String fileType, MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new InvalidRequestException("File is required");
        }
        if (fileType == null || fileType.isBlank()) {
            throw new InvalidRequestException("fileType is required");
        }
        if (hospitalId == null) {
            throw new InvalidRequestException("Hospital is required");
        }

        Patient patient = patientRepository.findById(patientId)
                .orElseThrow(() -> new ResourceNotFoundException("Patient not found"));

        // Ensure this hospital actually has an appointment with the patient
        boolean hasAppointment = appointmentRepository.existsByPatientIdAndDoctorHospitalId(patientId, hospitalId);
        if (!hasAppointment) {
            throw new InvalidRequestException("You can upload files only for patients who have appointments with your hospital");
        }

        Hospital hospital = hospitalRepository.findById(hospitalId)
                .orElseThrow(() -> new ResourceNotFoundException("Hospital not found"));

        String uploadsDir = "uploads/patient-files";
        Path uploadPath = Paths.get(uploadsDir);
        try {
            Files.createDirectories(uploadPath);

            String originalFilename = StringUtils.cleanPath(file.getOriginalFilename());
            String newFilename = System.currentTimeMillis() + "_" + originalFilename;
            Path targetPath = uploadPath.resolve(newFilename);

            Files.copy(file.getInputStream(), targetPath, StandardCopyOption.REPLACE_EXISTING);

            PatientFile patientFile = new PatientFile();
            patientFile.setPatient(patient);
            patientFile.setDoctor(null); // hospital upload, no specific doctor
            patientFile.setUploadedByHospital(hospital);
            patientFile.setFileName(originalFilename);
			// Store a web-accessible path; actual file is served via StaticResourceConfig
			String webPath = "/" + uploadsDir + "/" + newFilename; // e.g. /uploads/patient-files/123_file.pdf
			patientFile.setFilePath(webPath.replace("\\", "/"));
            patientFile.setFileType(fileType);
            patientFile.setFileSize(file.getSize());
            patientFile.setUploadedAt(LocalDateTime.now());
            patientFile.setDescription(null);

            patientFileRepository.save(patientFile);

            return mapper.map(patientFile, PatientFileItemDTO.class);
        } catch (IOException ex) {
            throw new InvalidRequestException("Could not store file. Please try again.");
        }
    }

    @Override
    public List<PatientFileItemDTO> getPatientFiles(Long patientId) {
        List<PatientFile> files = patientFileRepository.findByPatientId(patientId);
        return files.stream()
                .map(f -> mapper.map(f, PatientFileItemDTO.class))
                .toList();
    }

    @Override
    public void updateDoctorActiveStatus(Long doctorId, boolean isActive) {
        Doctor doctor = doctorRepository.findById(doctorId)
                .orElseThrow(() -> new ResourceNotFoundException("Doctor not found"));
        doctor.setActive(isActive);
        doctorRepository.save(doctor);
    }
}
