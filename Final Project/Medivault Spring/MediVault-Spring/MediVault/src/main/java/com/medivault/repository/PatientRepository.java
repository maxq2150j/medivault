package com.medivault.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.medivault.entites.Patient;

public interface PatientRepository extends JpaRepository<Patient, Long> {
	
	Optional<Patient> findByUserId(Long userId);
	
	List<Patient> findByNameContainingIgnoreCaseOrPhonenumberContaining(String name, String phonenumber);

}
