package com.medivault.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.medivault.entites.Appointment;
import com.medivault.enums.AppointmentStatus;

public interface AppointmentRepository extends JpaRepository<Appointment, Long> {

    List<Appointment> findByDoctorId(Long doctorId);

    List<Appointment> findByDoctorIdAndStatus(Long doctorId, AppointmentStatus status);

	List<Appointment> findByPatientIdOrderByAppointmentDateDesc(Long patientId);

	boolean existsByPatientIdAndDoctorHospitalId(Long patientId, Long hospitalId);
}
