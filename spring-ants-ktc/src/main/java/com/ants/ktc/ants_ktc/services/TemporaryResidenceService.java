package com.ants.ktc.ants_ktc.services;

import com.ants.ktc.ants_ktc.dtos.temporary_residence.TemporaryResidenceCreateRequest;
import com.ants.ktc.ants_ktc.dtos.temporary_residence.TemporaryResidenceResponse;
import com.ants.ktc.ants_ktc.dtos.temporary_residence.TemporaryResidenceUpdateRequest;
import com.ants.ktc.ants_ktc.entities.Contract;
import com.ants.ktc.ants_ktc.entities.TemporaryResidence;
import com.ants.ktc.ants_ktc.repositories.ContractJpaRepository;
import com.ants.ktc.ants_ktc.repositories.TemporaryResidenceJpaRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class TemporaryResidenceService {
    @Autowired
    private TemporaryResidenceJpaRepository temporaryResidenceRepository;
    @Autowired
    private ContractJpaRepository contractRepository;
    @Autowired
    private  CloudinaryService cloudinaryService;

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

        TemporaryResidence saved = temporaryResidenceRepository.save(temp);
        return convertToDto(saved);
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
                .idCardFrontUrl(entity.getIdCardFrontUrl())
                .idCardBackUrl(entity.getIdCardBackUrl())
                .build();
    }
}
