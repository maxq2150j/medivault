package com.medivault.entites;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import com.medivault.enums.PaymentStatus;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;


@Entity
@Table(name = "payments")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor

public class Payment {
	
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;
	
	@OneToOne(fetch = FetchType.LAZY, optional = false)
	@JoinColumn(name = "appointment_id", nullable = false, unique = true)
	private Appointment appointment;
	
	@Column(precision = 10, scale = 2, nullable = false)
	private BigDecimal amount;
	
	@Enumerated(EnumType.STRING)
	@Column(nullable = false, length = 20)
	private PaymentStatus paymentstatus = PaymentStatus.PENDING;
	
	@Column(length = 120)
	private String razorpayOrderId;
	
	@Column(length = 120)
	private String razorpayPaymentId;
	
	@Column(length = 200)
	private String razorpaySignature;
	
	private LocalDateTime requestedAt;
	
	private LocalDateTime completedAt;
	
	@Column(columnDefinition = "Text")
	private String failureReason;
	
	
}
