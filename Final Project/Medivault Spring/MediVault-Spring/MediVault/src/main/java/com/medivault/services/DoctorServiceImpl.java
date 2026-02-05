package com.medivault.services;

import java.util.List;

import java.math.BigDecimal;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Random;

import org.modelmapper.ModelMapper;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.medivault.dto.ConsultationItemDTO;
import com.medivault.dto.DoctorAppointmentItemDTO;
import com.medivault.dto.DoctorConsultationRequestDTO;
import com.medivault.dto.DoctorListItemDTO;
import com.medivault.dto.DoctorProfileResponseDTO;
import com.medivault.dto.DoctorProfileUpdateRequestDTO;
import com.medivault.dto.DoctorPasswordUpdateRequestDTO;
import com.medivault.dto.DoctorAccessRequestDTO;
import com.medivault.dto.DoctorVerifyOtpRequestDTO;
import com.medivault.entites.Appointment;
import com.medivault.entites.Consultation;
import com.medivault.entites.Doctor;
import com.medivault.entites.Payment;
import com.medivault.entites.User;
import com.medivault.enums.AppointmentStatus;
import com.medivault.enums.AccessRequestStatus;
import com.medivault.enums.PaymentStatus;
import com.medivault.exceptions.AuthenticationException;
import com.medivault.exceptions.InvalidRequestException;
import com.medivault.exceptions.ResourceNotFoundException;
import com.medivault.repository.AppointmentRepository;
import com.medivault.repository.DoctorRepository;
import com.medivault.repository.PatientRepository;
import com.medivault.repository.HospitalRepository;
import com.medivault.repository.DoctorAccessRequestRepository;
import com.medivault.repository.ConsultationRepository;
import com.medivault.repository.PaymentRepository;
import com.medivault.repository.UserRepository;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;

@Service
@Transactional
@RequiredArgsConstructor
public class DoctorServiceImpl implements DoctorService {

    private final AppointmentRepository appointmentRepository;
    private final DoctorRepository doctorRepository;
    private final ModelMapper mapper;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final PatientRepository patientRepository;
    private final HospitalRepository hospitalRepository;
    private final DoctorAccessRequestRepository doctorAccessRequestRepository;
    private final ConsultationRepository consultationRepository;
    private final EmailService emailService;
    private final PaymentRepository paymentRepository;

    @Override
    public List<DoctorAppointmentItemDTO> getDoctorAppointments(Long doctorId, String status) {
        AppointmentStatus statusEnum = null;
        if (status != null && !status.isBlank()) {
            try {
                statusEnum = AppointmentStatus.valueOf(status.toUpperCase());
            } catch (IllegalArgumentException ex) {
                throw new InvalidRequestException("Invalid appointment status: " + status);
            }
        }

        List<Appointment> appointments;
        if (statusEnum == null) {
            appointments = appointmentRepository.findByDoctorId(doctorId);
        } else {
            appointments = appointmentRepository.findByDoctorIdAndStatus(doctorId, statusEnum);
        }

        return appointments.stream().map(a -> {
            DoctorAppointmentItemDTO dto = new DoctorAppointmentItemDTO();
            dto.setId(a.getId());
            dto.setPatientId(a.getPatient().getId());
            dto.setPatientName(a.getPatient().getName());
            dto.setAppointmentDate(a.getAppointmentDate());
            dto.setStatus(a.getStatus().name());
            dto.setNotes(a.getNotes());
            dto.setPaymentRequired(a.isPaymentRequired());
            dto.setPaymentAmount(a.getPaymentAmount());
            dto.setPaymentCompleted(a.getPaymentstatus() == PaymentStatus.COMPLETED);
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
    public DoctorProfileResponseDTO getDoctorProfile(Long doctorId) {
        Doctor doctor = doctorRepository.findById(doctorId)
                .orElseThrow(() -> new ResourceNotFoundException("Doctor not found"));

        DoctorProfileResponseDTO dto = new DoctorProfileResponseDTO();
        dto.setId(doctor.getId());
        dto.setUserId(doctor.getUser().getId());
        dto.setHospitalId(doctor.getHospital().getId());
        dto.setName(doctor.getName());
        dto.setSpecialization(doctor.getSpecialization());
        dto.setLicenseNumber(doctor.getLicenseNumber());
        dto.setPhoneNumber(doctor.getPhoneNumber());
        dto.setProfilePicture(doctor.getProfilePicture());
        dto.setActive(doctor.isActive());
        dto.setEmail(doctor.getUser().getEmail());
        dto.setUsername(doctor.getUser().getUsername());
        return dto;
    }

    @Override
    public DoctorProfileResponseDTO updateDoctorProfile(Long doctorId, DoctorProfileUpdateRequestDTO dto) {
        Doctor doctor = doctorRepository.findById(doctorId)
                .orElseThrow(() -> new ResourceNotFoundException("Doctor not found"));

        if (dto.getName() != null && !dto.getName().isBlank()) {
            doctor.setName(dto.getName());
        }
        if (dto.getSpecialization() != null && !dto.getSpecialization().isBlank()) {
            doctor.setSpecialization(dto.getSpecialization());
        }
        if (dto.getPhoneNumber() != null && !dto.getPhoneNumber().isBlank()) {
            doctor.setPhoneNumber(dto.getPhoneNumber());
        }

        // Allow optional profile picture URL update
        if (dto.getProfilePicture() != null) {
            doctor.setProfilePicture(dto.getProfilePicture().isBlank() ? null : dto.getProfilePicture());
        }

        Doctor saved = doctorRepository.save(doctor);

        DoctorProfileResponseDTO response = new DoctorProfileResponseDTO();
        response.setId(saved.getId());
        response.setUserId(saved.getUser().getId());
        response.setHospitalId(saved.getHospital().getId());
        response.setName(saved.getName());
        response.setSpecialization(saved.getSpecialization());
        response.setLicenseNumber(saved.getLicenseNumber());
        response.setPhoneNumber(saved.getPhoneNumber());
        response.setProfilePicture(saved.getProfilePicture());
        response.setActive(saved.isActive());
        response.setEmail(saved.getUser().getEmail());
        response.setUsername(saved.getUser().getUsername());

        return response;
    }

    @Override
    public void updateDoctorPassword(Long doctorId, DoctorPasswordUpdateRequestDTO dto) {
        Doctor doctor = doctorRepository.findById(doctorId)
                .orElseThrow(() -> new ResourceNotFoundException("Doctor not found"));

        User user = doctor.getUser();

        if (!passwordEncoder.matches(dto.getCurrentPassword(), user.getPasswordHash())) {
            throw new AuthenticationException("Current password is incorrect");
        }

        user.setPasswordHash(passwordEncoder.encode(dto.getNewPassword()));
        userRepository.save(user);
    }

    private String generateOtp() {
        Random random = new Random();
        int otp = 100000 + random.nextInt(900000);
        return String.valueOf(otp);
    }

    @Override
    public Long createDoctorAccessRequest(DoctorAccessRequestDTO dto) {
        Doctor doctor = doctorRepository.findById(dto.getDoctorId())
                .orElseThrow(() -> new ResourceNotFoundException("Doctor not found"));
        var patient = patientRepository.findById(dto.getPatientId())
                .orElseThrow(() -> new ResourceNotFoundException("Patient not found"));

        String otp = generateOtp();
        var accessRequest = new com.medivault.entites.DoctorAccessRequest();
        accessRequest.setDoctor(doctor);
        accessRequest.setPatient(patient);
        accessRequest.setOtp(otp);
        accessRequest.setVerifield(false);
        accessRequest.setCreatedAt(LocalDateTime.now());
        accessRequest.setOtpSentAt(LocalDateTime.now());
        accessRequest.setAccessExpiAt(LocalDateTime.now().plusMinutes(15));
        accessRequest.setStatus(AccessRequestStatus.PENDING);

        var saved = doctorAccessRequestRepository.save(accessRequest);

        // Send OTP email to patient
        String to = patient.getUser().getEmail();
        String subject = "MediVault Consultation OTP";
        String text = "Dear " + patient.getName() + ",\n\n" +
                "Your one-time OTP for allowing Dr. " + doctor.getName() +
                " to view and record your consultation is: " + otp + "\n\n" +
                "This code is valid for 15 minutes.\n\nRegards,\nMediVault";
        emailService.sendEmail(to, subject, text);

        return saved.getId();
    }

    @Override
    public Long verifyDoctorAccessOtp(DoctorVerifyOtpRequestDTO dto) {
        var accessRequest = doctorAccessRequestRepository.findById(dto.getAccessRequestId())
                .orElseThrow(() -> new ResourceNotFoundException("Access request not found"));

        if (accessRequest.isVerifield()) {
            return accessRequest.getId();
        }

        if (accessRequest.getAccessExpiAt() != null && accessRequest.getAccessExpiAt().isBefore(LocalDateTime.now())) {
            throw new InvalidRequestException("OTP has expired. Please request a new one.");
        }

        if (!accessRequest.getOtp().equals(dto.getOtp())) {
            throw new InvalidRequestException("Invalid OTP");
        }

        accessRequest.setVerifield(true);
        accessRequest.setVerifiedAt(LocalDateTime.now());
        accessRequest.setStatus(AccessRequestStatus.APPROVED);
        doctorAccessRequestRepository.save(accessRequest);

        return accessRequest.getId();
    }

    @Override
    public List<ConsultationItemDTO> getPatientConsultationHistory(Long doctorId, Long patientId, Long accessRequestId) {
        var accessRequest = doctorAccessRequestRepository.findById(accessRequestId)
                .orElseThrow(() -> new ResourceNotFoundException("Access request not found"));

        if (!accessRequest.isVerifield() ||
                !accessRequest.getDoctor().getId().equals(doctorId) ||
                !accessRequest.getPatient().getId().equals(patientId)) {
            throw new InvalidRequestException("Access not allowed for this patient");
        }

        List<Consultation> consultations = consultationRepository
                .findByPatientIdAndDoctorIdOrderByDateDesc(patientId, doctorId);

        return consultations.stream()
                .map(c -> mapper.map(c, ConsultationItemDTO.class))
                .toList();
    }

    @Override
    public ConsultationItemDTO createConsultation(DoctorConsultationRequestDTO dto) {
        var doctor = doctorRepository.findById(dto.getDoctorId())
                .orElseThrow(() -> new ResourceNotFoundException("Doctor not found"));
        var patient = patientRepository.findById(dto.getPatientId())
                .orElseThrow(() -> new ResourceNotFoundException("Patient not found"));
        var hospital = hospitalRepository.findById(dto.getHospitalId())
                .orElseThrow(() -> new ResourceNotFoundException("Hospital not found"));

        Consultation consultation = new Consultation();
        consultation.setDoctor(doctor);
        consultation.setPatient(patient);
        consultation.setHospital(hospital);
        consultation.setDate(LocalDateTime.now());
        consultation.setDiagnosis(dto.getDiagnosis());
        consultation.setBp(dto.getBp());
        consultation.setSugar(dto.getSugar());
        consultation.setTemperature(dto.getTemperature());
        consultation.setMedicines(dto.getMedicines());

        // First save to get an ID for filename
        Consultation saved = consultationRepository.save(consultation);

        // Generate PDF report with table layout
        try {
            String uploadsDir = "uploads/consultations";
            Path uploadPath = Paths.get(uploadsDir);
            Files.createDirectories(uploadPath);

            String fileName = "consultation_" + saved.getId() + ".pdf";
            Path pdfPath = uploadPath.resolve(fileName);

            com.lowagie.text.Document document = new com.lowagie.text.Document();
            com.lowagie.text.pdf.PdfWriter.getInstance(document, Files.newOutputStream(pdfPath));
            document.open();

            com.lowagie.text.Font titleFont = new com.lowagie.text.Font(com.lowagie.text.Font.HELVETICA, 16,
                com.lowagie.text.Font.BOLD);
            com.lowagie.text.Font headerFont = new com.lowagie.text.Font(com.lowagie.text.Font.HELVETICA, 12,
                com.lowagie.text.Font.BOLD);
            com.lowagie.text.Font normalFont = new com.lowagie.text.Font(com.lowagie.text.Font.HELVETICA, 11,
                com.lowagie.text.Font.NORMAL);

            document.add(new com.lowagie.text.Paragraph("MEDICAL CONSULTATION REPORT", titleFont));
            document.add(new com.lowagie.text.Paragraph("Generated on: " + LocalDateTime.now().toString(), normalFont));
            document.add(com.lowagie.text.Chunk.NEWLINE);

            // Doctor & Hospital table
            com.lowagie.text.pdf.PdfPTable docTable = new com.lowagie.text.pdf.PdfPTable(2);
            docTable.setWidthPercentage(100);
            docTable.addCell(new com.lowagie.text.Phrase("Doctor Name", headerFont));
            docTable.addCell(new com.lowagie.text.Phrase(doctor.getName(), normalFont));
            docTable.addCell(new com.lowagie.text.Phrase("Specialization", headerFont));
            docTable.addCell(new com.lowagie.text.Phrase(doctor.getSpecialization(), normalFont));
            docTable.addCell(new com.lowagie.text.Phrase("Hospital", headerFont));
            docTable.addCell(new com.lowagie.text.Phrase(hospital.getName(), normalFont));
            document.add(docTable);

            document.add(com.lowagie.text.Chunk.NEWLINE);

            // Patient table
            com.lowagie.text.pdf.PdfPTable patientTable = new com.lowagie.text.pdf.PdfPTable(2);
            patientTable.setWidthPercentage(100);
            patientTable.addCell(new com.lowagie.text.Phrase("Patient Name", headerFont));
            patientTable.addCell(new com.lowagie.text.Phrase(patient.getName(), normalFont));
            patientTable.addCell(new com.lowagie.text.Phrase("Age", headerFont));
            patientTable.addCell(new com.lowagie.text.Phrase(
                patient.getAge() != null ? patient.getAge().toString() : "N/A", normalFont));
            patientTable.addCell(new com.lowagie.text.Phrase("Gender", headerFont));
            patientTable.addCell(new com.lowagie.text.Phrase(
                patient.getGender() != null ? patient.getGender().name() : "N/A", normalFont));
            document.add(patientTable);

            document.add(com.lowagie.text.Chunk.NEWLINE);

            // Vitals table
            com.lowagie.text.pdf.PdfPTable vitalsTable = new com.lowagie.text.pdf.PdfPTable(2);
            vitalsTable.setWidthPercentage(100);
            vitalsTable.addCell(new com.lowagie.text.Phrase("Blood Pressure", headerFont));
            vitalsTable.addCell(new com.lowagie.text.Phrase(dto.getBp() != null ? dto.getBp() : "N/A", normalFont));
            vitalsTable.addCell(new com.lowagie.text.Phrase("Sugar Level", headerFont));
            vitalsTable.addCell(new com.lowagie.text.Phrase(dto.getSugar() != null ? dto.getSugar() : "N/A", normalFont));
            vitalsTable.addCell(new com.lowagie.text.Phrase("Temperature", headerFont));
            vitalsTable.addCell(new com.lowagie.text.Phrase(
                dto.getTemperature() != null ? dto.getTemperature() : "N/A", normalFont));
            document.add(vitalsTable);

            document.add(com.lowagie.text.Chunk.NEWLINE);

            // Diagnosis & Medicines as full-width cells
            com.lowagie.text.pdf.PdfPTable diagTable = new com.lowagie.text.pdf.PdfPTable(1);
            diagTable.setWidthPercentage(100);
            diagTable.addCell(new com.lowagie.text.Phrase("Diagnosis", headerFont));
            diagTable.addCell(new com.lowagie.text.Phrase(
                dto.getDiagnosis() != null ? dto.getDiagnosis() : "N/A", normalFont));
            diagTable.addCell(new com.lowagie.text.Phrase("Medicines", headerFont));
            diagTable.addCell(new com.lowagie.text.Phrase(
                dto.getMedicines() != null ? dto.getMedicines() : "N/A", normalFont));
            document.add(diagTable);

            document.close();

            // Store web-accessible path (served by Spring static resource mapping if configured)
            saved.setPdfPath("/" + uploadsDir + "/" + fileName);
            saved = consultationRepository.save(saved);
        } catch (Exception ex) {
            // If PDF generation fails, we still keep the consultation without pdfPath
            saved.setPdfPath(null);
            consultationRepository.save(saved);
        }

        return mapper.map(saved, ConsultationItemDTO.class);
    }

    @Override
    public void updateAppointmentStatus(Long doctorId, Long appointmentId, String status) {
        Appointment appointment = appointmentRepository.findById(appointmentId)
                .orElseThrow(() -> new ResourceNotFoundException("Appointment not found"));
        if (!appointment.getDoctor().getId().equals(doctorId)) {
            throw new InvalidRequestException("Appointment does not belong to this doctor");
        }
        if (status == null || status.isBlank()) {
            throw new InvalidRequestException("Status is required");
        }
        AppointmentStatus newStatus;
        try {
            newStatus = AppointmentStatus.valueOf(status.toUpperCase());
        } catch (IllegalArgumentException ex) {
            throw new InvalidRequestException("Invalid status: " + status);
        }

        // Only allow non-approval statuses here; approval is done after successful payment
        if (newStatus == AppointmentStatus.APPROVED) {
            throw new InvalidRequestException("Use payment flow to approve appointments after payment");
        }

        appointment.setStatus(newStatus);
        appointmentRepository.save(appointment);
    }

    @Override
    public void requestPaymentForAppointment(Long doctorId, Long appointmentId, Double amount) {
        if (amount == null || amount <= 0) {
            throw new InvalidRequestException("Amount must be greater than zero");
        }
        Appointment appointment = appointmentRepository.findById(appointmentId)
                .orElseThrow(() -> new ResourceNotFoundException("Appointment not found"));
        if (!appointment.getDoctor().getId().equals(doctorId)) {
            throw new InvalidRequestException("Appointment does not belong to this doctor");
        }

        appointment.setPaymentRequired(true);
        appointment.setPaymentAmount(BigDecimal.valueOf(amount));
        appointment.setPaymentstatus(PaymentStatus.PENDING);
        appointmentRepository.save(appointment);

        Payment payment = paymentRepository.findByAppointmentId(appointmentId)
                .orElseGet(() -> {
                    Payment p = new Payment();
                    p.setAppointment(appointment);
                    return p;
                });
        payment.setAmount(BigDecimal.valueOf(amount));
        payment.setPaymentstatus(PaymentStatus.PENDING);
        payment.setRequestedAt(LocalDateTime.now());
        paymentRepository.save(payment);
    }
}
