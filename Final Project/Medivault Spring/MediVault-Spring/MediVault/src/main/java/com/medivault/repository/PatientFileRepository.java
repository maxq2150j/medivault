package com.medivault.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.medivault.entites.PatientFile;

public interface PatientFileRepository extends JpaRepository<PatientFile, Long> {

    List<PatientFile> findByPatientId(Long patientId);
}
