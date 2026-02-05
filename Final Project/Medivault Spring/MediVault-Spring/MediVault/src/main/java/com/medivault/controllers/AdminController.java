package com.medivault.controllers;

import java.util.List;
import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.medivault.dto.AdminStatsResponseDTO;
import com.medivault.dto.MessageResponseDTO;
import com.medivault.dto.RegisterHospitalRequestDTO;
import com.medivault.dto.SimpleHospitalResponseDTO;
import com.medivault.services.AdminService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class AdminController {

	private final AdminService adminService;

	@GetMapping("/stats")
	public ResponseEntity<AdminStatsResponseDTO> getStats() {
		return ResponseEntity.ok(adminService.getAdminStats());
	}

	@GetMapping("/hospitals")
	public ResponseEntity<List<SimpleHospitalResponseDTO>> getHospitals() {
		return ResponseEntity.ok(adminService.getAllHospitals());
	}

	@PostMapping("/hospitals")
	public ResponseEntity<MessageResponseDTO> addHospital(@RequestBody @Valid RegisterHospitalRequestDTO dto) {
		return ResponseEntity.ok(adminService.createHospital(dto));
	}

	@PutMapping("/hospitals/{id}/toggle-status")
	public ResponseEntity<MessageResponseDTO> toggleHospitalStatus(@PathVariable Long id) {
		return ResponseEntity.ok(adminService.toggleHospitalStatus(id));
	}
}
