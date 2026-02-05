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
@Table(name = "consultations")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor

public class Consultation {
	
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;
	
	@ManyToOne(fetch = FetchType.LAZY, optional = false)
	@JoinColumn(name = "patient_id", nullable = false)
	private Patient patient;
	
	@ManyToOne(fetch = FetchType.LAZY, optional = false)
	@JoinColumn(name = "doctor_id", nullable = false)
	private Doctor doctor;
	
	@ManyToOne(fetch = FetchType.LAZY, optional = false)
	@JoinColumn(name = "hospital_id", nullable = false)
	private Hospital hospital;
	
	private LocalDateTime date;
	
	@Column(columnDefinition = "TEXT")
	private String diagnosis;
	
	@Column(length = 50)
	private String bp;
	
	@Column(length = 50)
	private String sugar;
	
	@Column(length = 50)
	private String temperature;
	
	@Column(columnDefinition = "TEXT")
	private String medicines = "[]";
	
	@Column(columnDefinition = "TEXT")
	private String pdfPath;
}
