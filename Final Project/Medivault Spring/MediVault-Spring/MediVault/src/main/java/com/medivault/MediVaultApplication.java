package com.medivault;

import org.modelmapper.Conditions;
import org.modelmapper.ModelMapper;
import org.modelmapper.convention.MatchingStrategies;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;

import com.medivault.dto.ConsultationItemDTO;
import com.medivault.dto.DoctorListItemDTO;
import com.medivault.dto.DoctorProfileResponseDTO;
import com.medivault.dto.LoginResponseDTO;
import com.medivault.dto.PatientFileItemDTO;
import com.medivault.dto.PatientProfileResponseDTO;
import com.medivault.entites.*;


@SpringBootApplication
public class MediVaultApplication {

	public static void main(String[] args) {
		SpringApplication.run(MediVaultApplication.class, args);
	}
	
	@Bean
	public ModelMapper modelMapper() {
		
		ModelMapper mapper = new ModelMapper();

        mapper.getConfiguration()
              .setMatchingStrategy(MatchingStrategies.STRICT)
              .setPropertyCondition(Conditions.isNotNull());
	
	
	// USER -> AuthResponseDTO (user.getId -> response.userId)
    mapper.typeMap(User.class, LoginResponseDTO.class)
          .addMappings(m -> m.map(User::getId, LoginResponseDTO::setUserId));

    // PATIENT -> PatientProfileResponseDTO
    mapper.typeMap(Patient.class, PatientProfileResponseDTO.class).addMappings(m -> {
        m.map(Patient::getId, PatientProfileResponseDTO::setId);
        m.map(src -> src.getUser().getId(), PatientProfileResponseDTO::setUserId);
        m.skip(PatientProfileResponseDTO::setUsername);
        m.skip(PatientProfileResponseDTO::setEmail);
    });

    // DOCTOR -> DoctorProfileResponseDTO
    mapper.typeMap(Doctor.class, DoctorProfileResponseDTO.class).addMappings(m -> {
        m.map(Doctor::getId, DoctorProfileResponseDTO::setId);
        m.map(src -> src.getUser().getId(), DoctorProfileResponseDTO::setUserId);
        m.map(src -> src.getHospital().getId(), DoctorProfileResponseDTO::setHospitalId);
        m.skip(DoctorProfileResponseDTO::setUsername);
        m.skip(DoctorProfileResponseDTO::setEmail);
    });

    // DOCTOR -> DoctorListItemDTO (Hospital side list)
    mapper.typeMap(Doctor.class, DoctorListItemDTO.class).addMappings(m -> {
        m.map(Doctor::getId, DoctorListItemDTO::setId);
        m.map(src -> src.getHospital().getId(), DoctorListItemDTO::setHospitalId);
        m.map(src -> src.getUser().getUsername(), DoctorListItemDTO::setUsername);
        m.map(src -> src.getUser().getEmail(), DoctorListItemDTO::setEmail);
    });

    // CONSULTATION -> ConsultationItemDTO
    mapper.typeMap(Consultation.class, ConsultationItemDTO.class).addMappings(m -> {
        m.map(Consultation::getId, ConsultationItemDTO::setId);
        m.map(src -> src.getPatient().getId(), ConsultationItemDTO::setPatientId);
        m.map(src -> src.getDoctor().getId(), ConsultationItemDTO::setDoctorId);
        m.map(src -> src.getHospital().getId(), ConsultationItemDTO::setHospitalId);
    });

    // PATIENT FILE -> PatientFileItemDTO
    mapper.typeMap(PatientFile.class, PatientFileItemDTO.class).addMappings(m -> {
        m.map(PatientFile::getId, PatientFileItemDTO::setId);
        m.map(src -> src.getPatient().getId(), PatientFileItemDTO::setPatientId);

        // nullable relations
        m.map(src -> src.getDoctor() == null ? null : src.getDoctor().getId(), PatientFileItemDTO::setDoctorId);
        m.map(src -> src.getUploadedByHospital() == null ? null : src.getUploadedByHospital().getId(),
              PatientFileItemDTO::setUploadedByHospitalId);
    });

    return mapper;
}

}
