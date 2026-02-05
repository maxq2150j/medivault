package com.medivault.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.medivault.entites.Admin;

public interface AdminRepository extends JpaRepository<Admin, Long> {

    Optional<Admin> findByUserId(Long userId);
    
}