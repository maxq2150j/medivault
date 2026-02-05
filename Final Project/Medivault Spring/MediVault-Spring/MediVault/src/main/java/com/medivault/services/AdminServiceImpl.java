package com.medivault.services;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.medivault.dto.AdminStatsResponseDTO;
import com.medivault.dto.MessageResponseDTO;
import com.medivault.dto.RecentVisitDTO;
import com.medivault.dto.RegisterHospitalRequestDTO;
import com.medivault.dto.SimpleHospitalResponseDTO;
import com.medivault.entites.Consultation;
import com.medivault.entites.Hospital;
import com.medivault.entites.Patient;
import com.medivault.entites.User;
import com.medivault.enums.Role;
import com.medivault.exceptions.InvalidRequestException;
import com.medivault.exceptions.ResourceNotFoundException;
import com.medivault.repository.ConsultationRepository;
import com.medivault.repository.HospitalRepository;
import com.medivault.repository.PatientRepository;
import com.medivault.repository.UserRepository;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;

@Service
@Transactional
@RequiredArgsConstructor
public class AdminServiceImpl implements AdminService {

	private final HospitalRepository hospitalRepository;
	private final PatientRepository patientRepository;
	private final ConsultationRepository consultationRepository;
	private final UserRepository userRepository;
	private final PasswordEncoder passwordEncoder;

	@Override
	public AdminStatsResponseDTO getAdminStats() {
		long totalHospitals = hospitalRepository.count();
		long totalPatients = patientRepository.count();
		long totalVisits = consultationRepository.count();

		List<Consultation> recent = consultationRepository
			.findTop10ByOrderByDateDesc();

		List<RecentVisitDTO> recentVisits = recent.stream().map(c -> {
			RecentVisitDTO dto = new RecentVisitDTO();
			dto.setDate(c.getDate());
			dto.setHospitalName(c.getDoctor() != null && c.getDoctor().getHospital() != null
					? c.getDoctor().getHospital().getName()
					: "-");
			dto.setPatientName(c.getPatient() != null ? c.getPatient().getName() : "-");
			return dto;
		}).collect(Collectors.toList());

		AdminStatsResponseDTO response = new AdminStatsResponseDTO();
		response.setTotalHospitals(totalHospitals);
		response.setTotalPatients(totalPatients);
		response.setTotalVisits(totalVisits);
		response.setRecentVisits(recentVisits);
		return response;
	}

	@Override
	public List<SimpleHospitalResponseDTO> getAllHospitals() {
		return hospitalRepository.findAll().stream().map(h -> {
			SimpleHospitalResponseDTO dto = new SimpleHospitalResponseDTO();
			dto.setId(h.getId());
			dto.setName(h.getName());
			dto.setAddress(h.getAddress());
			User user = h.getUser();
			if (user != null) {
				dto.setUsername(user.getUsername());
				dto.setEmail(user.getEmail());
			}
			dto.setActive(h.isActive());
			return dto;
		}).collect(Collectors.toList());
	}

	@Override
	public MessageResponseDTO createHospital(RegisterHospitalRequestDTO dto) {
		if (userRepository.existsByUsername(dto.getUsername())) {
			throw new InvalidRequestException("Username already taken");
		}

		if (userRepository.existsByEmail(dto.getEmail())) {
			throw new InvalidRequestException("Email already exists");
		}

		User user = new User();
		user.setUsername(dto.getUsername());
		user.setPasswordHash(passwordEncoder.encode(dto.getPassword()));
		user.setEmail(dto.getEmail());
		user.setRole(Role.HOSPITAL);

		User saved = userRepository.save(user);

		Hospital hospital = new Hospital();
		hospital.setUser(saved);
		hospital.setName(dto.getName());
		hospital.setAddress(dto.getAddress());
		hospital.setActive(true);

		hospitalRepository.save(hospital);

		return new MessageResponseDTO("Hospital added successfully");
	}

	@Override
	public MessageResponseDTO toggleHospitalStatus(Long hospitalId) {
		Hospital hospital = hospitalRepository.findById(hospitalId)
				.orElseThrow(() -> new ResourceNotFoundException("Hospital not found"));

		hospital.setActive(!hospital.isActive());
		hospitalRepository.save(hospital);

		String message = hospital.isActive() ? "Hospital activated successfully" : "Hospital deactivated successfully";
		return new MessageResponseDTO(message);
	}
}
