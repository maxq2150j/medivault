package com.medivault.services;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.util.Map;
import java.util.UUID;

import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;

import com.medivault.dto.LoginRequestDTO;
import com.medivault.dto.LoginResponseDTO;
import com.medivault.dto.MessageResponseDTO;
import com.medivault.dto.RegisterDoctorRequestDTO;
import com.medivault.dto.RegisterHospitalRequestDTO;
import com.medivault.dto.RegisterPatientRequestDTO;
import com.medivault.dto.RegisterAdminRequestDTO;
import com.medivault.entites.Admin;
import com.medivault.entites.Doctor;
import com.medivault.entites.Hospital;
import com.medivault.entites.Patient;
import com.medivault.entites.User;
import com.medivault.enums.Gender;
import com.medivault.enums.Role;
import com.medivault.exceptions.AuthenticationException;
import com.medivault.exceptions.InvalidRequestException;
import com.medivault.exceptions.ResourceNotFoundException;
import com.medivault.repository.AdminRepository;
import com.medivault.repository.DoctorRepository;
import com.medivault.repository.HospitalRepository;
import com.medivault.repository.PatientRepository;
import com.medivault.repository.UserRepository;
import com.medivault.services.JwtService;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;

@Service
@Transactional
@RequiredArgsConstructor

public class AuthServiceimpl implements AuthService {
	
	private final UserRepository userRepository;
	private final PatientRepository patientRepository;
    private final HospitalRepository hospitalRepository;
    private final DoctorRepository doctorRepository;
    private final AdminRepository adminRepository;
    
    private final ModelMapper mapper;
	private final PasswordEncoder passwordEncoder;
	private final JwtService jwtService;

		@Value("${google.clientId}")
		private String googleClientId;

	@Override
	public LoginResponseDTO login(LoginRequestDTO dto) {
		// Find user by username and validate password using PasswordEncoder
		User user = userRepository
				.findByUsername(dto.getUsername())
				.orElseThrow(() -> new AuthenticationException("User does not exist"));
		
		if (!passwordEncoder.matches(dto.getPassword(), user.getPasswordHash())) {
			throw new AuthenticationException("Invalid Username or Password");
		}
		
			return buildLoginResponse(user);
		
	}

		@Override
		public LoginResponseDTO loginWithGoogle(String idToken) {
			if (idToken == null || idToken.isBlank()) {
				throw new InvalidRequestException("Google ID token is required");
			}

			try {
				String url = "https://oauth2.googleapis.com/tokeninfo?id_token="
						+ URLEncoder.encode(idToken, StandardCharsets.UTF_8);
				RestTemplate restTemplate = new RestTemplate();
				@SuppressWarnings("unchecked")
				Map<String, Object> tokenInfo = restTemplate.getForObject(url, Map.class);
				if (tokenInfo == null) {
					throw new AuthenticationException("Invalid Google token");
				}

				String audience = (String) tokenInfo.get("aud");
				if (audience == null || !audience.equals(googleClientId)) {
					throw new AuthenticationException("Google token client mismatch");
				}

				String email = (String) tokenInfo.get("email");
				String name = (String) tokenInfo.get("name");
				Object emailVerifiedObj = tokenInfo.get("email_verified");
				boolean emailVerified = emailVerifiedObj != null && Boolean.parseBoolean(String.valueOf(emailVerifiedObj));

				if (email == null || !emailVerified) {
					throw new AuthenticationException("Unverified Google account");
				}

				User user = userRepository.findByEmail(email).orElse(null);
				if (user == null) {
					// Auto-create a patient account for first-time Google users
					user = new User();
					user.setUsername(email);
					user.setPasswordHash(passwordEncoder.encode(UUID.randomUUID().toString()));
					user.setEmail(email);
					user.setRole(Role.PATIENT);
					User savedUser = userRepository.save(user);

					Patient patient = new Patient();
					patient.setUser(savedUser);
					patient.setName(name != null ? name : email);
					patient.setAge(0);
					patient.setGender(Gender.OTHER);
					patient.setPhonenumber("NA");
					patientRepository.save(patient);

					user = savedUser;
				}

				return buildLoginResponse(user);
			} catch (RestClientException ex) {
				throw new AuthenticationException("Failed to validate Google token");
			}
		}

		private LoginResponseDTO buildLoginResponse(User user) {
			LoginResponseDTO response = mapper.map(user, LoginResponseDTO.class);

			Long specificId = 0L;
			String name = "";

			// Checking conditions
			if (user.getRole() == Role.PATIENT) {
				Patient p = patientRepository.findByUserId(user.getId())
						.orElseThrow(() -> new ResourceNotFoundException("Patient profile not found"));

				specificId = p.getId();
				name = p.getName();
			}

			else if (user.getRole() == Role.DOCTOR) {
				Doctor d = doctorRepository.findByUserId(user.getId())
						.orElseThrow(() -> new ResourceNotFoundException("Doctor profile not found"));

				if (!d.isActive()) {
					throw new AuthenticationException("Doctor Account is inactive. Please contact hospital administrator");
				}

				specificId = d.getId();
				name = d.getName();
			}

			else if (user.getRole() == Role.HOSPITAL) {
				Hospital h = hospitalRepository.findByUserId(user.getId())
						.orElseThrow(() -> new ResourceNotFoundException("Hospital profile not found"));

				if (!h.isActive()) {
					throw new AuthenticationException("Hospital Account is inactive. Please contact system administrator");
				}

				specificId = h.getId();
				name = h.getName();
			}

			else if (user.getRole() == Role.ADMIN) {
				Admin a = adminRepository.findByUserId(user.getId())
						.orElseThrow(() -> new ResourceNotFoundException("Admin profile not found"));

				specificId = a.getId();
				name = a.getName();
			}

			response.setName(name);
			response.setSpecificId(specificId);
			// generate JWT token similar to RationSahayata implementation
			String token = jwtService.generateToken(user);
			response.setToken(token);
			response.setMessage("Login is successful");

			return response;
		}

	@Override
	public MessageResponseDTO registerPatient(RegisterPatientRequestDTO dto) {
		
		if(userRepository.existsByUsername(dto.getUsername())) {
			throw new InvalidRequestException("Username already taken");
		}
		
		if(userRepository.existsByEmail(dto.getEmail())) {
			throw new InvalidRequestException("Email already exists");
		}
		
		User user = new User();
		user.setUsername(dto.getUsername());
		user.setPasswordHash(passwordEncoder.encode(dto.getPassword()));
		user.setEmail(dto.getEmail());
		user.setRole(Role.PATIENT);
		
		User saved = userRepository.save(user);
		
		Patient patient = new Patient();
		patient.setUser(saved);
		patient.setName(dto.getName());
		patient.setAge(dto.getAge());
		patient.setGender(dto.getGender());
		patient.setPhonenumber(dto.getPhoneNumber());
		
		patientRepository.save(patient);
		
		return new MessageResponseDTO("Patient registered successfully");
	}

	@Override
	public MessageResponseDTO registerHospital(RegisterHospitalRequestDTO dto) {
		
		if(userRepository.existsByUsername(dto.getUsername())) {
			throw new InvalidRequestException("Username already taken");
		}
		
		if(userRepository.existsByEmail(dto.getEmail())) {
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
		
		return new MessageResponseDTO("Hospital registered successfully");
		
	}

	@Override
    public MessageResponseDTO registerDoctor(RegisterDoctorRequestDTO dto) {

        if (userRepository.existsByUsername(dto.getUsername())) {
            throw new InvalidRequestException("Username already taken");
        }
        
        if (userRepository.existsByEmail(dto.getEmail())) {
            throw new InvalidRequestException("Email already exists");
        }

        Hospital hospital = hospitalRepository.findById(dto.getHospitalId())
                .orElseThrow(() -> new ResourceNotFoundException("Hospital not found"));

		User user = new User();
		user.setUsername(dto.getUsername());
		user.setPasswordHash(passwordEncoder.encode(dto.getPassword()));
        user.setEmail(dto.getEmail());
        user.setRole(Role.DOCTOR);

        User saved = userRepository.save(user);

        Doctor doctor = new Doctor();
        doctor.setUser(saved);
        doctor.setHospital(hospital);
        doctor.setName(dto.getName());
        doctor.setSpecialization(dto.getSpecialization());
        doctor.setLicenseNumber(dto.getLicenseNumber());
        doctor.setPhoneNumber(dto.getPhoneNumber());
        doctor.setDate(LocalDateTime.now());

        doctorRepository.save(doctor);

        return new MessageResponseDTO("Doctor registered successfully");
    }

	@Override
	public MessageResponseDTO registerAdmin(RegisterAdminRequestDTO dto) {

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
		user.setRole(Role.ADMIN);

		User saved = userRepository.save(user);

		Admin admin = new Admin();
		admin.setUser(saved);
		admin.setName(dto.getName());
		adminRepository.save(admin);

		return new MessageResponseDTO("Admin registered successfully");
	}
}


