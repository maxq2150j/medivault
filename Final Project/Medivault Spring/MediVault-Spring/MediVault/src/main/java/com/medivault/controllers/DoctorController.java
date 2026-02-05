package com.medivault.controllers;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.medivault.dto.ConsultationItemDTO;
import com.medivault.dto.DoctorAccessRequestDTO;
import com.medivault.dto.DoctorAppointmentItemDTO;
import com.medivault.dto.DoctorConsultationRequestDTO;
import com.medivault.dto.DoctorListItemDTO;
import com.medivault.dto.DoctorPasswordUpdateRequestDTO;
import com.medivault.dto.DoctorProfileResponseDTO;
import com.medivault.dto.DoctorProfileUpdateRequestDTO;
import com.medivault.dto.DoctorVerifyOtpRequestDTO;
import com.medivault.dto.MessageResponseDTO;
import com.medivault.services.DoctorService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/doctor")
@RequiredArgsConstructor
public class DoctorController {

	private final DoctorService doctorService;

	@GetMapping("/{doctorId}")
	public ResponseEntity<?> getDoctorProfile(@PathVariable Long doctorId) {
		DoctorProfileResponseDTO doctor = doctorService.getDoctorProfile(doctorId);
		Map<String, Object> response = new HashMap<>();
		response.put("doctor", doctor);
		return ResponseEntity.ok(response);
	}

	@PutMapping("/{doctorId}/profile")
	public ResponseEntity<?> updateDoctorProfile(@PathVariable Long doctorId,
			@RequestBody DoctorProfileUpdateRequestDTO dto) {
		DoctorProfileResponseDTO updated = doctorService.updateDoctorProfile(doctorId, dto);
		Map<String, Object> response = new HashMap<>();
		response.put("doctor", updated);
		response.put("message", "Profile updated successfully");
		return ResponseEntity.ok(response);
	}
	
	@GetMapping("/{doctorId}/appointments")
	public ResponseEntity<?> getDoctorAppointments(@PathVariable Long doctorId, @RequestParam(required = false) String status){
		List<DoctorAppointmentItemDTO> list = doctorService.getDoctorAppointments(doctorId, status);
		return ResponseEntity.ok(list);
	}

	@PostMapping("/appointments/{appointmentId}/status")
	public ResponseEntity<MessageResponseDTO> updateAppointmentStatus(
			@PathVariable Long appointmentId,
			@RequestBody Map<String, Object> body) {
		// Frontend sends { DoctorId, Status }
		Long doctorId = body.get("DoctorId") instanceof Number
				? ((Number) body.get("DoctorId")).longValue()
				: null;
		String status = (String) body.get("Status");
		doctorService.updateAppointmentStatus(doctorId, appointmentId, status);
		return ResponseEntity.ok(new MessageResponseDTO("Appointment status updated"));
	}

	@PostMapping("/appointments/{appointmentId}/request-payment")
	public ResponseEntity<MessageResponseDTO> requestPayment(
			@PathVariable Long appointmentId,
			@RequestBody Map<String, Object> body) {
		Long doctorId = body.get("DoctorId") instanceof Number
				? ((Number) body.get("DoctorId")).longValue()
				: null;
		Double amount = body.get("Amount") instanceof Number
				? ((Number) body.get("Amount")).doubleValue()
				: null;
		doctorService.requestPaymentForAppointment(doctorId, appointmentId, amount);
		return ResponseEntity.ok(new MessageResponseDTO("Payment request created"));
	}

	@PutMapping("/{doctorId}/password")
	public ResponseEntity<MessageResponseDTO> updateDoctorPassword(@PathVariable Long doctorId,
			@RequestBody DoctorPasswordUpdateRequestDTO dto) {
		doctorService.updateDoctorPassword(doctorId, dto);
		return ResponseEntity.ok(new MessageResponseDTO("Password updated successfully"));
	}

	@PostMapping("/request-access")
	public ResponseEntity<?> requestAccess(@RequestBody DoctorAccessRequestDTO dto) {
		Long id = doctorService.createDoctorAccessRequest(dto);
		Map<String, Object> response = new HashMap<>();
		response.put("accessRequestId", id);
		response.put("message", "OTP has been sent to patient email address");
		return ResponseEntity.ok(response);
	}

	@PostMapping("/verify-otp")
	public ResponseEntity<?> verifyOtp(@RequestBody DoctorVerifyOtpRequestDTO dto) {
		Long id = doctorService.verifyDoctorAccessOtp(dto);
		Map<String, Object> response = new HashMap<>();
		response.put("accessRequestId", id);
		response.put("message", "OTP verified successfully");
		return ResponseEntity.ok(response);
	}

	@GetMapping("/patient-history/{patientId}")
	public ResponseEntity<?> getPatientHistory(@PathVariable Long patientId,
			@RequestParam Long doctorId,
			@RequestParam Long accessRequestId) {
		List<ConsultationItemDTO> list = doctorService.getPatientConsultationHistory(doctorId, patientId, accessRequestId);
		Map<String, Object> response = new HashMap<>();
		response.put("consultations", list);
		return ResponseEntity.ok(response);
	}

	@PostMapping("/submit-consultation")
	public ResponseEntity<?> submitConsultation(@RequestBody DoctorConsultationRequestDTO dto) {
		ConsultationItemDTO created = doctorService.createConsultation(dto);
		Map<String, Object> response = new HashMap<>();
		response.put("consultation", created);
		// PdfUrl can be added later when PDF generation is implemented
		return ResponseEntity.ok(response);
	}

	@GetMapping("/hospital/{hospitalId}")
	public ResponseEntity<?> getDoctorsByHospital(@PathVariable Long hospitalId) {
		List<DoctorListItemDTO> doctors = doctorService.getDoctorsByHospital(hospitalId);
		Map<String, Object> response = new HashMap<>();
		response.put("doctors", doctors);
		return ResponseEntity.ok(response);
	}
	
}
