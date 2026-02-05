package com.medivault.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.medivault.entites.Consultation;

public interface AdminConsultationRepository extends JpaRepository<Consultation, Long> {

	List<Consultation> findTop10ByOrderByDateDesc();
}
