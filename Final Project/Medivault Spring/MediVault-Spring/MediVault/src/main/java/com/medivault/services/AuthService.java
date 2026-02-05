package com.medivault.services;

import com.medivault.dto.LoginRequestDTO;
import com.medivault.dto.LoginResponseDTO;
import com.medivault.dto.MessageResponseDTO;
import com.medivault.dto.RegisterDoctorRequestDTO;
import com.medivault.dto.RegisterAdminRequestDTO;
import com.medivault.dto.RegisterHospitalRequestDTO;
import com.medivault.dto.RegisterPatientRequestDTO;

public interface AuthService {
	
	LoginResponseDTO login(LoginRequestDTO dto);
	
	// Login or sign up using Google ID token
	LoginResponseDTO loginWithGoogle(String idToken);
	
	MessageResponseDTO registerPatient(RegisterPatientRequestDTO dto);
	
	MessageResponseDTO registerHospital(RegisterHospitalRequestDTO dto);
	
	MessageResponseDTO registerDoctor(RegisterDoctorRequestDTO dto);

	MessageResponseDTO registerAdmin(RegisterAdminRequestDTO dto);

}
