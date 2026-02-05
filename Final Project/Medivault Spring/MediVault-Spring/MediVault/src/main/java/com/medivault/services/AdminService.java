package com.medivault.services;

import java.util.List;

import com.medivault.dto.AdminStatsResponseDTO;
import com.medivault.dto.MessageResponseDTO;
import com.medivault.dto.RegisterHospitalRequestDTO;
import com.medivault.dto.SimpleHospitalResponseDTO;

public interface AdminService {

	AdminStatsResponseDTO getAdminStats();

	List<SimpleHospitalResponseDTO> getAllHospitals();

	MessageResponseDTO createHospital(RegisterHospitalRequestDTO dto);

	MessageResponseDTO toggleHospitalStatus(Long hospitalId);
}
