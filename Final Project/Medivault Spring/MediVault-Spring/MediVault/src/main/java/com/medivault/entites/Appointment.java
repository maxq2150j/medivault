package com.medivault.entites;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import com.medivault.enums.AppointmentStatus;
import com.medivault.enums.PaymentStatus;

import jakarta.persistence.CascadeType;
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
@Table(name = "appointments")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor

public class Appointment {
	
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;
	
	@ManyToOne(fetch = FetchType.LAZY, optional = false)
	@JoinColumn(name = "patient_id", nullable = false)
	private Patient patient;
	
	@ManyToOne(fetch = FetchType.LAZY, optional = false)
	@JoinColumn(name = "doctor_id", nullable = false)
	private Doctor doctor;
	
	@Column(nullable = false)
	private LocalDateTime appointmentDate;
	
	@Enumerated(EnumType.STRING)
	@Column(nullable = false, length = 20)
	private AppointmentStatus status = AppointmentStatus.PENDING;
	
	@Column(columnDefinition = "TEXT")
	private String notes;
	
	@Column(nullable = false)
	private boolean paymentRequired = false;
	
	@Column(precision = 10, scale = 2)
	private BigDecimal paymentAmount;
	
	@Enumerated(EnumType.STRING)
	@Column(nullable = false, length = 20)
	private PaymentStatus paymentstatus = PaymentStatus.NOT_REQUESTED;
	
	@OneToOne(mappedBy = "appointment", cascade = CascadeType.ALL)
	private DoctorAccessRequest accessRequest;
	
	@OneToOne(mappedBy = "appointment", cascade = CascadeType.ALL)
	private Payment payment;
}
