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
@Table(name = "patient_files")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor

public class PatientFile {
	
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;
	
	@ManyToOne(fetch = FetchType.LAZY, optional = false)
	@JoinColumn(name = "patient_id", nullable = false)
	private Patient patient;
	
	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "doctor_id")
	private Doctor doctor;
	
	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "uploaded_by_hospital_id")
	private Hospital uploadedByHospital;
	
	@Column(nullable = false, length = 500)
	private String fileName;
	
	@Column(nullable = false, length = 500)
	private String filePath;
	
	@Column(nullable = false, length = 800)
	private String fileType;
	
	@Column(nullable = false, length = 500)
	private Long fileSize;
	
	private LocalDateTime uploadedAt;
	
	@Column(columnDefinition = "TEXT")
	private String description;
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
}
