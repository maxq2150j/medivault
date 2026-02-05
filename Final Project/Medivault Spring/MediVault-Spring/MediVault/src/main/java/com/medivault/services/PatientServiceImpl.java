package com.medivault.services;

import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.List;

import org.modelmapper.ModelMapper;
import org.springframework.stereotype.Service;

import com.medivault.dto.ConsultationItemDTO;
import com.medivault.dto.DoctorListItemDTO;
import com.medivault.dto.HospitalListItemDTO;
import com.medivault.dto.PatientAppointmentItemDTO;
import com.medivault.dto.PatientAppointmentRequestDTO;
import com.medivault.dto.PatientProfileResponseDTO;
import com.medivault.dto.PatientRecordItemDTO;
import com.medivault.entites.Appointment;
import com.medivault.entites.Consultation;
import com.medivault.entites.Doctor;
import com.medivault.entites.Hospital;
import com.medivault.entites.Patient;
import com.medivault.entites.User;
import com.medivault.enums.AppointmentStatus;
import com.medivault.enums.PaymentStatus;
import com.medivault.exceptions.InvalidRequestException;
import com.medivault.exceptions.ResourceNotFoundException;
import com.medivault.repository.AppointmentRepository;
import com.medivault.repository.ConsultationRepository;
import com.medivault.repository.DoctorRepository;
import com.medivault.repository.HospitalRepository;
import com.medivault.repository.PatientRepository;
import com.medivault.repository.UserRepository;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;

@Service
@Transactional
@RequiredArgsConstructor
public class PatientServiceImpl implements PatientService {

	private final UserRepository userRepository;
	private final PatientRepository patientRepository;
	private final HospitalRepository hospitalRepository;
	private final DoctorRepository doctorRepository;
	private final AppointmentRepository appointmentRepository;
	private final ConsultationRepository consultationRepository;
	private final ModelMapper mapper;

	@Override
	public PatientProfileResponseDTO getCurrentPatientProfile(String username) {
		if (username == null || username.isBlank()) {
			throw new ResourceNotFoundException("User not found");
		}

		User user = userRepository.findByUsername(username)
				.orElseThrow(() -> new ResourceNotFoundException("User not found"));

		Patient patient = patientRepository.findByUserId(user.getId())
				.orElseThrow(() -> new ResourceNotFoundException("Patient profile not found"));

		PatientProfileResponseDTO dto = mapper.map(patient, PatientProfileResponseDTO.class);
		dto.setUsername(user.getUsername());
		dto.setEmail(user.getEmail());
		dto.setPhoneNumber(patient.getPhonenumber());
		return dto;
	}

	@Override
	public List<HospitalListItemDTO> getAllHospitals() {
		List<Hospital> hospitals = hospitalRepository.findAll();
		return hospitals.stream().map(h -> {
			HospitalListItemDTO dto = new HospitalListItemDTO();
			dto.setId(h.getId());
			dto.setName(h.getName());
			dto.setActive(h.isActive());
			return dto;
		}).toList();
	}

	@Override
	public List<DoctorListItemDTO> getDoctorsByHospital(Long hospitalId) {
		List<Doctor> doctors = doctorRepository.findByHospitalId(hospitalId);
		return doctors.stream()
				.map(d -> mapper.map(d, DoctorListItemDTO.class))
				.toList();
	}

	@Override
	public void createAppointmentForCurrentPatient(String username, PatientAppointmentRequestDTO dto) {
		if (username == null || username.isBlank()) {
			throw new ResourceNotFoundException("User not found");
		}

		User user = userRepository.findByUsername(username)
				.orElseThrow(() -> new ResourceNotFoundException("User not found"));

		Patient patient = patientRepository.findByUserId(user.getId())
				.orElseThrow(() -> new ResourceNotFoundException("Patient profile not found"));

		Doctor doctor = doctorRepository.findById(dto.getDoctorId())
				.orElseThrow(() -> new ResourceNotFoundException("Doctor not found"));

		if (dto.getHospitalId() == null) {
			throw new InvalidRequestException("HospitalId is required");
		}

		if (!doctor.getHospital().getId().equals(dto.getHospitalId())) {
			throw new InvalidRequestException("Selected doctor does not belong to the chosen hospital");
		}

		if (dto.getAppointmentDate() == null) {
			throw new InvalidRequestException("AppointmentDate is required");
		}

		LocalDateTime appointmentDateTime = LocalDateTime.ofInstant(
				dto.getAppointmentDate(), ZoneId.of("Asia/Kolkata"));

		Appointment appointment = new Appointment();
		appointment.setPatient(patient);
		appointment.setDoctor(doctor);
		appointment.setAppointmentDate(appointmentDateTime);
		appointment.setStatus(AppointmentStatus.PENDING);
		appointment.setNotes(dto.getNotes());
		// For now, no payment required; can be enabled later
		appointment.setPaymentRequired(false);
		appointment.setPaymentAmount(null);
		appointment.setPaymentstatus(PaymentStatus.NOT_REQUESTED);

		appointmentRepository.save(appointment);
	}

	@Override
	public List<PatientAppointmentItemDTO> getAppointmentsForCurrentPatient(String username) {
		if (username == null || username.isBlank()) {
			throw new ResourceNotFoundException("User not found");
		}

		User user = userRepository.findByUsername(username)
				.orElseThrow(() -> new ResourceNotFoundException("User not found"));

		Patient patient = patientRepository.findByUserId(user.getId())
				.orElseThrow(() -> new ResourceNotFoundException("Patient profile not found"));

		List<Appointment> appointments = appointmentRepository
				.findByPatientIdOrderByAppointmentDateDesc(patient.getId());

		return appointments.stream().map(a -> {
			PatientAppointmentItemDTO dto = new PatientAppointmentItemDTO();
			dto.setId(a.getId());
			dto.setDoctorId(a.getDoctor().getId());
			dto.setDoctorName(a.getDoctor().getName());
			dto.setHospitalId(a.getDoctor().getHospital().getId());
			dto.setHospitalName(a.getDoctor().getHospital().getName());
			dto.setAppointmentDate(a.getAppointmentDate());
			dto.setStatus(mapAppointmentStatus(a.getStatus()));
			dto.setNotes(a.getNotes());
			dto.setPaymentRequired(a.isPaymentRequired());
			dto.setPaymentAmount(a.getPaymentAmount());
			dto.setPaymentStatus(a.getPaymentstatus() == PaymentStatus.COMPLETED ? "Completed" : "Pending");
			return dto;
		}).toList();
	}

	@Override
	public List<ConsultationItemDTO> getConsultationsForCurrentPatient(String username) {
		if (username == null || username.isBlank()) {
			throw new ResourceNotFoundException("User not found");
		}

		User user = userRepository.findByUsername(username)
				.orElseThrow(() -> new ResourceNotFoundException("User not found"));

		Patient patient = patientRepository.findByUserId(user.getId())
				.orElseThrow(() -> new ResourceNotFoundException("Patient profile not found"));

		List<Consultation> consultations = consultationRepository
				.findByPatientIdOrderByDateDesc(patient.getId());

		return consultations.stream()
				.map(c -> mapper.map(c, ConsultationItemDTO.class))
				.toList();
	}

	@Override
	public List<PatientRecordItemDTO> getRecordsForCurrentPatient(String username) {
		if (username == null || username.isBlank()) {
			throw new ResourceNotFoundException("User not found");
		}

		User user = userRepository.findByUsername(username)
				.orElseThrow(() -> new ResourceNotFoundException("User not found"));

		Patient patient = patientRepository.findByUserId(user.getId())
				.orElseThrow(() -> new ResourceNotFoundException("Patient profile not found"));

		List<Consultation> consultations = consultationRepository
				.findByPatientIdOrderByDateDesc(patient.getId());

		return consultations.stream()
				.map(c -> {
					PatientRecordItemDTO dto = new PatientRecordItemDTO();
					dto.setId(c.getId());
					dto.setHospitalName(c.getHospital() != null ? c.getHospital().getName() : null);
					dto.setDoctorName(c.getDoctor() != null ? c.getDoctor().getName() : null);
					dto.setDate(c.getDate());
					dto.setPdfPath(c.getPdfPath());
					dto.setDiagnosis(c.getDiagnosis());
					dto.setMedicines(c.getMedicines());
					return dto;
				})
				.toList();
	}

	private String mapAppointmentStatus(AppointmentStatus status) {
		if (status == null) {
			return "Pending";
		}
		return switch (status) {
		case APPROVED -> "Approved";
		case DENIED -> "Denied";
		case CANCELLED -> "Cancelled";
		case COMPLETED -> "Completed";
		case PENDING -> "Pending";
		};
	}
}
