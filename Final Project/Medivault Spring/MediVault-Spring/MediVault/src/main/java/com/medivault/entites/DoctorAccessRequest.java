package com.medivault.entites;

import java.time.LocalDateTime;

import com.medivault.enums.AccessRequestStatus;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "doctor_access_requests")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor

public class DoctorAccessRequest {
	
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;
	
	@ManyToOne(fetch = FetchType.LAZY, optional = false)
	@JoinColumn(name = "doctor_id", nullable = false)
	private Doctor doctor;
	
	@ManyToOne(fetch = FetchType.LAZY, optional = false)
	@JoinColumn(name = "patient_id", nullable = false)
	private Patient patient;
	
	@OneToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "appointment_id", unique = true)
	private Appointment appointment;
	
	@Column(nullable = false, length = 10)
	private String otp;
	
	@Column(nullable = false)
	private boolean isVerifield = false;
	
	private LocalDateTime createdAt;
	
	private LocalDateTime otpSentAt;
	
	private LocalDateTime verifiedAt;
	
	private LocalDateTime accessExpiAt;
	
	@Enumerated(EnumType.STRING)
	@Column(nullable = false, length = 20)
	private AccessRequestStatus status = AccessRequestStatus.PENDING;
}
