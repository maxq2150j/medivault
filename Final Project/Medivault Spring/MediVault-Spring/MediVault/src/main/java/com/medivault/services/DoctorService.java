package com.medivault.services;

import java.util.List;

import com.medivault.dto.DoctorAppointmentItemDTO;
import com.medivault.dto.ConsultationItemDTO;
import com.medivault.dto.DoctorConsultationRequestDTO;
import com.medivault.dto.DoctorListItemDTO;
import com.medivault.dto.DoctorProfileResponseDTO;
import com.medivault.dto.DoctorProfileUpdateRequestDTO;
import com.medivault.dto.DoctorPasswordUpdateRequestDTO;
import com.medivault.dto.DoctorAccessRequestDTO;
import com.medivault.dto.DoctorVerifyOtpRequestDTO;

public interface DoctorService {

	List<DoctorAppointmentItemDTO> getDoctorAppointments(Long doctorId, String status);

	List<DoctorListItemDTO> getDoctorsByHospital(Long hospitalId);

	DoctorProfileResponseDTO getDoctorProfile(Long doctorId);

	DoctorProfileResponseDTO updateDoctorProfile(Long doctorId, DoctorProfileUpdateRequestDTO dto);

	void updateDoctorPassword(Long doctorId, DoctorPasswordUpdateRequestDTO dto);

	Long createDoctorAccessRequest(DoctorAccessRequestDTO dto);

	Long verifyDoctorAccessOtp(DoctorVerifyOtpRequestDTO dto);

	java.util.List<ConsultationItemDTO> getPatientConsultationHistory(Long doctorId, Long patientId, Long accessRequestId);

	ConsultationItemDTO createConsultation(DoctorConsultationRequestDTO dto);

	void updateAppointmentStatus(Long doctorId, Long appointmentId, String status);

	void requestPaymentForAppointment(Long doctorId, Long appointmentId, Double amount);

}
