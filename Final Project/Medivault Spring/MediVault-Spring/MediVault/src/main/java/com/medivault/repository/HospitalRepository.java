package com.medivault.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.medivault.entites.Hospital;

public interface HospitalRepository extends JpaRepository<Hospital, Long> {

    Optional<Hospital> findByUserId(Long userId);
    
}