package com.medivault.entites;

import java.time.LocalDateTime;
import java.util.List;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "doctors", uniqueConstraints = {
		@UniqueConstraint(name = "uk_doctors_user_id", columnNames = "user_id"),
		@UniqueConstraint(name = "uk_doctors_license", columnNames = "license_number")
})

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor

public class Doctor {
	
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;
	
	@OneToOne(fetch = FetchType.LAZY, optional = false)
	@JoinColumn(name = "user_id", nullable = false)
	private User user;
	
	@ManyToOne(fetch = FetchType.LAZY, optional = false)
	@JoinColumn(name = "hospital_id", nullable = false)
	private Hospital hospital;
	
	@Column(nullable = false, length = 150)
	private String name;
	
	@Column(nullable = false, length = 100)
	private String specialization;
	
	@Column(name = "license_number", nullable = false, length = 25)
	private String licenseNumber;
	
	@Column(length = 15)
	private String phoneNumber;

	@Column(name = "profile_picture", length = 500)
	private String profilePicture;
	
	@Column(nullable = false)
	private boolean isActive = true;
	
	private LocalDateTime date;
	
	@OneToMany(mappedBy = "doctor", cascade = CascadeType.ALL, orphanRemoval = true)
	private List<Appointment> appointments;
	
	@OneToMany(mappedBy = "doctor", cascade = CascadeType.ALL, orphanRemoval = true)
	private List<DoctorAccessRequest> accessRequests;

}
