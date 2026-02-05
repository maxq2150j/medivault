package com.medivault.services;

import java.util.List;

import com.medivault.dto.ConsultationItemDTO;
import com.medivault.dto.DoctorListItemDTO;
import com.medivault.dto.HospitalListItemDTO;
import com.medivault.dto.PatientAppointmentItemDTO;
import com.medivault.dto.PatientAppointmentRequestDTO;
import com.medivault.dto.PatientProfileResponseDTO;
import com.medivault.dto.PatientRecordItemDTO;

public interface PatientService {

	PatientProfileResponseDTO getCurrentPatientProfile(String username);

	List<HospitalListItemDTO> getAllHospitals();

	List<DoctorListItemDTO> getDoctorsByHospital(Long hospitalId);

	void createAppointmentForCurrentPatient(String username, PatientAppointmentRequestDTO dto);

	List<PatientAppointmentItemDTO> getAppointmentsForCurrentPatient(String username);

	List<ConsultationItemDTO> getConsultationsForCurrentPatient(String username);

	List<PatientRecordItemDTO> getRecordsForCurrentPatient(String username);
}
