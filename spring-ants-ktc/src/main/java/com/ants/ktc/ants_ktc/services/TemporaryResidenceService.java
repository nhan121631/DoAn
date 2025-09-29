package com.ants.ktc.ants_ktc.services;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import com.ants.ktc.ants_ktc.dtos.LandlordTask.LandlordTaskCreateDto;
import com.ants.ktc.ants_ktc.dtos.temporary_residence.TemporaryResidenceCreateRequest;
import com.ants.ktc.ants_ktc.dtos.temporary_residence.TemporaryResidenceResponse;
import com.ants.ktc.ants_ktc.dtos.temporary_residence.TemporaryResidenceUpdateRequest;
import com.ants.ktc.ants_ktc.entities.Contract;
import com.ants.ktc.ants_ktc.entities.TemporaryResidence;
import com.ants.ktc.ants_ktc.repositories.ContractJpaRepository;
import com.ants.ktc.ants_ktc.repositories.LandlordTaskJpaRepository;
import com.ants.ktc.ants_ktc.repositories.TemporaryResidenceJpaRepository;

@Service
public class TemporaryResidenceService {
    @Autowired
    private TemporaryResidenceJpaRepository temporaryResidenceRepository;
    @Autowired
    private ContractJpaRepository contractRepository;
    @Autowired
    private CloudinaryService cloudinaryService;
    @Autowired
    private LandlordTaskService landlordTaskService;

    @Autowired
    private LandlordTaskJpaRepository landlordTaskJpaRepository;

    public TemporaryResidenceResponse create(TemporaryResidenceCreateRequest request,
            MultipartFile frontImage,
            MultipartFile backImage) {
        Contract contract = contractRepository.findById(request.getContractId())
                .orElseThrow(() -> new IllegalArgumentException("Contract not found"));

        TemporaryResidence temp = new TemporaryResidence();
        temp.setContract(contract);
        temp.setFullName(request.getFullName());
        temp.setIdNumber(request.getIdNumber());
        temp.setRelationship(request.getRelationship());
        temp.setStartDate(request.getStartDate());
        temp.setEndDate(request.getEndDate());
        temp.setNote(request.getNote());
        temp.setStatus("PENDING");

        // Upload ảnh mặt trước
        if (frontImage != null && !frontImage.isEmpty()) {
            Map<String, String> upload = cloudinaryService.uploadFile(frontImage);
            temp.setIdCardFrontUrl(upload.get("url"));
            temp.setIdCardFrontPublicId(upload.get("publicId"));
        }

        // Upload ảnh mặt sau
        if (backImage != null && !backImage.isEmpty()) {
            Map<String, String> upload = cloudinaryService.uploadFile(backImage);
            temp.setIdCardBackUrl(upload.get("url"));
            temp.setIdCardBackPublicId(upload.get("publicId"));
        }

        UUID landlordId = temporaryResidenceRepository.findLandlordByTemporaryResidenceId(request.getContractId());
        if (landlordId == null) {
            throw new IllegalArgumentException("Landlord not found for the room");
        }
        UUID roomId = temporaryResidenceRepository.findRoomIdByTemporaryResidenceId(request.getContractId());
        if (roomId == null) {
            throw new IllegalArgumentException("Room not found for the room");
        }

        TemporaryResidence saved = temporaryResidenceRepository.save(temp);
        LandlordTaskCreateDto dto = LandlordTaskCreateDto.builder()
                .title("Temporary Residence: " + request.getNote().substring(0,
                        Math.min(20, request.getNote().length())) + "...")
                .description(request.getNote())
                .startDate(LocalDateTime.now())
                .dueDate(LocalDateTime.now().plusDays(1))
                .status("PENDING")
                .type("TEMPORARY_RESIDENCE")
                .relatedEntityId(saved.getId())
                .priority("HIGH")
                .landlordId(landlordId.toString())
                .roomId(roomId.toString())
                .build();
        landlordTaskService.createTask(dto);
        return convertToDto(saved);
    }

    public List<TemporaryResidenceResponse> getByLandlord(UUID landlordId) {
        return temporaryResidenceRepository.findByLandlordId(landlordId)
                .stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    public List<TemporaryResidenceResponse> getByTenant(UUID tenantId) {
        return temporaryResidenceRepository.findByTenantId(tenantId)
                .stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    public TemporaryResidenceResponse update(UUID id,
            TemporaryResidenceUpdateRequest request,
            MultipartFile frontImage,
            MultipartFile backImage) {
        TemporaryResidence temp = temporaryResidenceRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("TemporaryResidence not found"));

        temp.setFullName(request.getFullName());
        temp.setIdNumber(request.getIdNumber());
        temp.setRelationship(request.getRelationship());
        temp.setStartDate(request.getStartDate());
        temp.setEndDate(request.getEndDate());
        temp.setNote(request.getNote());
        temp.setStatus(request.getStatus());

        if (temp.getStatus().equals("DONE")) {
            landlordTaskJpaRepository.updateTaskStatus(temp.getId(), "COMPLETED");
        }

        // Nếu có upload ảnh mới -> xóa ảnh cũ + upload ảnh mới
        if (frontImage != null && !frontImage.isEmpty()) {
            if (temp.getIdCardFrontPublicId() != null) {
                cloudinaryService.deleteFile(temp.getIdCardFrontPublicId());
            }
            Map<String, String> upload = cloudinaryService.uploadFile(frontImage);
            temp.setIdCardFrontUrl(upload.get("url"));
            temp.setIdCardFrontPublicId(upload.get("publicId"));
        }

        if (backImage != null && !backImage.isEmpty()) {
            if (temp.getIdCardBackPublicId() != null) {
                cloudinaryService.deleteFile(temp.getIdCardBackPublicId());
            }
            Map<String, String> upload = cloudinaryService.uploadFile(backImage);
            temp.setIdCardBackUrl(upload.get("url"));
            temp.setIdCardBackPublicId(upload.get("publicId"));
        }

        TemporaryResidence saved = temporaryResidenceRepository.save(temp);
        return convertToDto(saved);
    }

    public List<TemporaryResidenceResponse> getByContract(UUID contractId) {
        return temporaryResidenceRepository.findByContractId(contractId)
                .stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    public void delete(UUID id) {
        TemporaryResidence temp = temporaryResidenceRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("TemporaryResidence not found"));

        if (temp.getIdCardFrontPublicId() != null) {
            cloudinaryService.deleteFile(temp.getIdCardFrontPublicId());
        }
        if (temp.getIdCardBackPublicId() != null) {
            cloudinaryService.deleteFile(temp.getIdCardBackPublicId());
        }

        temporaryResidenceRepository.delete(temp);
    }

    public TemporaryResidenceResponse convertToDto(TemporaryResidence entity) {

        return TemporaryResidenceResponse.builder()
                .id(entity.getId())
                .contractId(entity.getContract().getId())
                .fullName(entity.getFullName())
                .idNumber(entity.getIdNumber())
                .relationship(entity.getRelationship())
                .startDate(entity.getStartDate())
                .endDate(entity.getEndDate())
                .note(entity.getNote())
                .status(entity.getStatus())
                .idCardFrontUrl(entity.getIdCardFrontUrl())
                .idCardBackUrl(entity.getIdCardBackUrl())
                .build();
    }
}
