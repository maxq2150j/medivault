package com.medivault.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.medivault.entites.Payment;

public interface PaymentRepository extends JpaRepository<Payment, Long> {

	Optional<Payment> findByAppointmentId(Long appointmentId);
}
