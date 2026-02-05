package com.medivault.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.medivault.entites.Consultation;

public interface ConsultationRepository extends JpaRepository<Consultation, Long> {

    List<Consultation> findByPatientIdAndDoctorIdOrderByDateDesc(Long patientId, Long doctorId);

    List<Consultation> findByPatientIdOrderByDateDesc(Long patientId);

    List<Consultation> findTop10ByOrderByDateDesc();
}

