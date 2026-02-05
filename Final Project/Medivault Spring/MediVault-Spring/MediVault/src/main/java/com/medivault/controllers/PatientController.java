package com.medivault.controllers;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.medivault.dto.ConsultationItemDTO;
import com.medivault.dto.DoctorListItemDTO;
import com.medivault.dto.HospitalListItemDTO;
import com.medivault.dto.MessageResponseDTO;
import com.medivault.dto.PatientAppointmentItemDTO;
import com.medivault.dto.PatientAppointmentRequestDTO;
import com.medivault.dto.PatientProfileResponseDTO;
import com.medivault.dto.PatientRecordItemDTO;
import com.medivault.entites.Appointment;
import com.medivault.entites.Payment;
import com.medivault.entites.Patient;
import com.medivault.entites.User;
import com.medivault.enums.PaymentStatus;
import com.medivault.exceptions.InvalidRequestException;
import com.medivault.exceptions.ResourceNotFoundException;
import com.medivault.repository.AppointmentRepository;
import com.medivault.repository.PatientRepository;
import com.medivault.repository.PaymentRepository;
import com.medivault.repository.UserRepository;
import com.medivault.services.PatientService;
import com.razorpay.Order;
import com.razorpay.RazorpayClient;

import jakarta.transaction.Transactional;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/patient")
@RequiredArgsConstructor
@Transactional
public class PatientController {

	private final PatientService patientService;
	private final UserRepository userRepository;
	private final PatientRepository patientRepository;
	private final AppointmentRepository appointmentRepository;
	private final PaymentRepository paymentRepository;

	@Value("${razorpay.keyId}")
	private String razorpayKeyId;

	@Value("${razorpay.keySecret}")
	private String razorpayKeySecret;

	@GetMapping("/profile")
	public ResponseEntity<PatientProfileResponseDTO> getProfile(Authentication authentication) {
		if (authentication == null || !authentication.isAuthenticated()) {
			return ResponseEntity.status(401).build();
		}
		String username = authentication.getName();
		PatientProfileResponseDTO dto = patientService.getCurrentPatientProfile(username);
		return ResponseEntity.ok(dto);
	}

	@GetMapping("/hospitals")
	public ResponseEntity<List<HospitalListItemDTO>> getHospitals() {
		List<HospitalListItemDTO> hospitals = patientService.getAllHospitals();
		return ResponseEntity.ok(hospitals);
	}

	@GetMapping("/doctors-by-hospital/{hospitalId}")
	public ResponseEntity<List<DoctorListItemDTO>> getDoctorsByHospital(@PathVariable Long hospitalId) {
		List<DoctorListItemDTO> doctors = patientService.getDoctorsByHospital(hospitalId);
		return ResponseEntity.ok(doctors);
	}

	@PostMapping("/appointments")
	public ResponseEntity<MessageResponseDTO> createAppointment(Authentication authentication,
			@RequestBody PatientAppointmentRequestDTO dto) {
		if (authentication == null || !authentication.isAuthenticated()) {
			return ResponseEntity.status(401).build();
		}
		String username = authentication.getName();
		patientService.createAppointmentForCurrentPatient(username, dto);
		return ResponseEntity.ok(new MessageResponseDTO("Appointment requested successfully"));
	}

	@GetMapping("/appointments")
	public ResponseEntity<List<PatientAppointmentItemDTO>> getAppointments(Authentication authentication) {
		if (authentication == null || !authentication.isAuthenticated()) {
			return ResponseEntity.status(401).build();
		}
		String username = authentication.getName();
		List<PatientAppointmentItemDTO> appointments = patientService.getAppointmentsForCurrentPatient(username);
		return ResponseEntity.ok(appointments);
	}

	@GetMapping("/consultations")
	public ResponseEntity<List<ConsultationItemDTO>> getConsultations(Authentication authentication) {
		if (authentication == null || !authentication.isAuthenticated()) {
			return ResponseEntity.status(401).build();
		}
		String username = authentication.getName();
		List<ConsultationItemDTO> consultations = patientService.getConsultationsForCurrentPatient(username);
		return ResponseEntity.ok(consultations);
	}

	@GetMapping("/records")
	public ResponseEntity<List<PatientRecordItemDTO>> getRecords(Authentication authentication) {
		if (authentication == null || !authentication.isAuthenticated()) {
			return ResponseEntity.status(401).build();
		}
		String username = authentication.getName();
		List<PatientRecordItemDTO> records = patientService.getRecordsForCurrentPatient(username);
		return ResponseEntity.ok(records);
	}

	@PostMapping("/appointments/{appointmentId}/initiate-payment")
	public ResponseEntity<?> initiatePayment(Authentication authentication, @PathVariable Long appointmentId) {
		if (authentication == null || !authentication.isAuthenticated()) {
			return ResponseEntity.status(401).build();
		}
		String username = authentication.getName();
		User user = userRepository.findByUsername(username)
				.orElseThrow(() -> new ResourceNotFoundException("User not found"));
		Patient patient = patientRepository.findByUserId(user.getId())
				.orElseThrow(() -> new ResourceNotFoundException("Patient profile not found"));
		Appointment appointment = appointmentRepository.findById(appointmentId)
				.orElseThrow(() -> new ResourceNotFoundException("Appointment not found"));

		if (!appointment.getPatient().getId().equals(patient.getId())) {
			throw new InvalidRequestException("Appointment does not belong to this patient");
		}
		if (!appointment.isPaymentRequired() || appointment.getPaymentAmount() == null) {
			throw new InvalidRequestException("No payment required for this appointment");
		}

		try {
			RazorpayClient client = new RazorpayClient(razorpayKeyId, razorpayKeySecret);
			int amountInPaise = appointment.getPaymentAmount().multiply(java.math.BigDecimal.valueOf(100)).intValue();
			org.json.JSONObject options = new org.json.JSONObject();
			options.put("amount", amountInPaise);
			options.put("currency", "INR");
			options.put("receipt", "appt_" + appointmentId);
			Order order = client.orders.create(options);

			Payment payment = paymentRepository.findByAppointmentId(appointmentId)
					.orElseGet(() -> {
						Payment p = new Payment();
						p.setAppointment(appointment);
						return p;
					});
			payment.setAmount(appointment.getPaymentAmount());
			payment.setPaymentstatus(PaymentStatus.PENDING);
			payment.setRazorpayOrderId(order.get("id"));
			payment.setRequestedAt(java.time.LocalDateTime.now());
			paymentRepository.save(payment);

			Map<String, Object> response = new HashMap<>();
			response.put("orderId", order.get("id"));
			response.put("amount", appointment.getPaymentAmount());
			response.put("razorpayKeyId", razorpayKeyId);
			response.put("patientName", patient.getName());
			response.put("patientEmail", user.getEmail());
			return ResponseEntity.ok(response);
		} catch (Exception ex) {
			throw new InvalidRequestException("Failed to initiate payment: " + ex.getMessage());
		}
	}

	@PostMapping("/appointments/{appointmentId}/verify-payment")
	public ResponseEntity<MessageResponseDTO> verifyPayment(Authentication authentication,
			@PathVariable Long appointmentId,
			@RequestBody Map<String, String> body) {
		if (authentication == null || !authentication.isAuthenticated()) {
			return ResponseEntity.status(401).build();
		}

		String paymentId = body.get("PaymentId");
		String signature = body.get("Signature");
		if (paymentId == null || signature == null) {
			throw new InvalidRequestException("PaymentId and Signature are required");
		}

		Payment payment = paymentRepository.findByAppointmentId(appointmentId)
				.orElseThrow(() -> new ResourceNotFoundException("Payment record not found"));
		String orderId = payment.getRazorpayOrderId();
		if (orderId == null) {
			throw new InvalidRequestException("Order not created for this payment");
		}

		try {
			String payload = orderId + "|" + paymentId;
			javax.crypto.Mac mac = javax.crypto.Mac.getInstance("HmacSHA256");
			javax.crypto.spec.SecretKeySpec secretKeySpec = new javax.crypto.spec.SecretKeySpec(razorpayKeySecret.getBytes(), "HmacSHA256");
			mac.init(secretKeySpec);
			byte[] hmac = mac.doFinal(payload.getBytes(java.nio.charset.StandardCharsets.UTF_8));
			StringBuilder sb = new StringBuilder();
			for (byte b : hmac) {
				sb.append(String.format("%02x", b));
			}
			String generatedSignature = sb.toString();

			if (!generatedSignature.equals(signature)) {
				payment.setPaymentstatus(PaymentStatus.FAILED);
				payment.setFailureReason("Signature verification failed");
				paymentRepository.save(payment);
				throw new InvalidRequestException("Payment signature verification failed");
			}

			payment.setPaymentstatus(PaymentStatus.COMPLETED);
			payment.setRazorpayPaymentId(paymentId);
			payment.setRazorpaySignature(signature);
			payment.setCompletedAt(java.time.LocalDateTime.now());
			paymentRepository.save(payment);

			Appointment appointment = payment.getAppointment();
			appointment.setPaymentstatus(PaymentStatus.COMPLETED);
			appointment.setStatus(com.medivault.enums.AppointmentStatus.APPROVED);
			appointmentRepository.save(appointment);

			return ResponseEntity.ok(new MessageResponseDTO("Payment verified and appointment approved"));
		} catch (InvalidRequestException ex) {
			throw ex;
		} catch (Exception ex) {
			throw new InvalidRequestException("Failed to verify payment: " + ex.getMessage());
		}
	}
}
