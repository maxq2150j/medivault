package com.medivault.entites;

import java.util.List;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.OneToMany;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "hospitals", uniqueConstraints = {
		@UniqueConstraint(name = "uk_hospitals_user_id", columnNames = "user_id")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor

public class Hospital {
	
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;
	
	@OneToOne(fetch = FetchType.LAZY, optional = false)
	@JoinColumn(name = "user_id", nullable = false)
	private User user;
	
	@Column(nullable = false, length = 150)
	private String name;
	
	@Column(nullable = false, columnDefinition = "TEXT")
	private String address;
	
	@Column(length = 15)
	private String contactNumber;
	
	@Column(nullable = false)
	private boolean isActive = false;
	
	@OneToMany(mappedBy = "hospital", cascade = CascadeType.ALL, orphanRemoval = true)
	private List<Doctor> doctors;
	
	@OneToMany(mappedBy = "hospital", cascade = CascadeType.ALL, orphanRemoval = true)
	private List<Consultation> consultations;
	
	@OneToMany(mappedBy = "uploadedByHospital", cascade = CascadeType.ALL)
	private List<PatientFile> patientFiles;
	
}
