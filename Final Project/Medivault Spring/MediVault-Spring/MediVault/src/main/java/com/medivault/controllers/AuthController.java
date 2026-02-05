package com.medivault.controllers;

import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.medivault.dto.LoginRequestDTO;
import com.medivault.dto.RegisterDoctorRequestDTO;
import com.medivault.dto.RegisterHospitalRequestDTO;
import com.medivault.dto.RegisterPatientRequestDTO;
import com.medivault.dto.RegisterAdminRequestDTO;
import com.medivault.services.AuthService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor

public class AuthController {
	
	private final AuthService authService;
	
	// Register Patient
	@PostMapping("/register/patient")
	public ResponseEntity<?> registerPatient(@RequestBody @Valid RegisterPatientRequestDTO dto){
		return ResponseEntity.ok(authService.registerPatient(dto));
	}
	
	// Patient Login
	@PostMapping("/login")
	public ResponseEntity<?> loginPatient(@RequestBody @Valid LoginRequestDTO dto){
		return ResponseEntity.ok(authService.login(dto));
	}

	// Google Login / Sign-up
	@PostMapping("/login/google")
	public ResponseEntity<?> loginWithGoogle(@RequestBody Map<String, String> request) {
		String idToken = request.get("idToken");
		return ResponseEntity.ok(authService.loginWithGoogle(idToken));
	}
	
	@PostMapping("/register/hospital")
	public ResponseEntity<?> registerHospital(@RequestBody @Valid RegisterHospitalRequestDTO dto){
		return ResponseEntity.ok(authService.registerHospital(dto));
	}
	
	@PostMapping("/register/doctor")
	public ResponseEntity<?> registerDoctor(@RequestBody @Valid RegisterDoctorRequestDTO dto){
		return ResponseEntity.ok(authService.registerDoctor(dto));
	}
	
	@PostMapping("/register/admin")
	public ResponseEntity<?> registerAdmin(@RequestBody @Valid RegisterAdminRequestDTO dto){
		return ResponseEntity.ok(authService.registerAdmin(dto));
	}
	
}
