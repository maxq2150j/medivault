package com.medivault.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.medivault.entites.DoctorAccessRequest;

public interface DoctorAccessRequestRepository extends JpaRepository<DoctorAccessRequest, Long> {

    Optional<DoctorAccessRequest> findTopByDoctorIdAndPatientIdOrderByCreatedAtDesc(Long doctorId, Long patientId);
}
