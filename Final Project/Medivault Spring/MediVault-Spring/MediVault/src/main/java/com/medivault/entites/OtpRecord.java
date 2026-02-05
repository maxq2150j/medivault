package com.medivault.entites;

import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "otp_records")

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor

public class OtpRecord {
	
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;
	
	@ManyToOne(fetch = FetchType.LAZY, optional = false)
	@JoinColumn(name = "patient_id", nullable = false)
	private Patient patient;
	
	@Column(nullable = false, length = 10)
	private String code;
	
	@Column(nullable = false)
	private LocalDateTime expiry;
	
	@Column(nullable = false)
	private boolean isUsed = false;
	
	private Long requestedByHospitalId;
}
