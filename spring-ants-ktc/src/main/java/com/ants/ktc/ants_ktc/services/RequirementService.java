package com.ants.ktc.ants_ktc.services;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import com.ants.ktc.ants_ktc.dtos.LandlordTask.LandlordTaskCreateDto;
import com.ants.ktc.ants_ktc.dtos.requirement.RequirementLandlordResponseDto;
import com.ants.ktc.ants_ktc.dtos.requirement.RequirementPaging;
import com.ants.ktc.ants_ktc.dtos.requirement.RequirementRequestRoomDto;
import com.ants.ktc.ants_ktc.dtos.requirement.RequirementRequestUpdateDto;
import com.ants.ktc.ants_ktc.dtos.requirement.RequirementUserResponseDto;
import com.ants.ktc.ants_ktc.entities.Requirement;
import com.ants.ktc.ants_ktc.entities.Room;
import com.ants.ktc.ants_ktc.entities.User;
import com.ants.ktc.ants_ktc.repositories.LandlordTaskJpaRepository;
import com.ants.ktc.ants_ktc.repositories.RequirementJpaRepository;
import com.ants.ktc.ants_ktc.repositories.RoomJpaRepository;
import com.ants.ktc.ants_ktc.repositories.UserJpaRepository;
import com.ants.ktc.ants_ktc.repositories.projection.RequirementLandLordProjection;
import com.ants.ktc.ants_ktc.repositories.projection.RequirementUserProjection;

import jakarta.persistence.EntityNotFoundException;
import jakarta.transaction.Transactional;

@Service
public class RequirementService {

        @Autowired
        private RequirementJpaRepository requirementJpaRepository;
        @Autowired
        private RoomJpaRepository roomJpaRepository;
        @Autowired
        private UserJpaRepository userJpaRepository;
        @Autowired
        private CloudinaryService cloudinaryService;
        @Autowired
        private LandlordTaskService landlordTaskService;
        @Autowired
        private LandlordTaskJpaRepository landlordTaskJpaRepository;

        RequirementService(LandlordTaskJpaRepository landlordTaskJpaRepository) {
                this.landlordTaskJpaRepository = landlordTaskJpaRepository;
        }

        @Transactional
        public RequirementRequestRoomDto createRequestRoomWithImage(RequirementRequestRoomDto requestRoomDto,
                        MultipartFile image) {
                User user = userJpaRepository.findById(requestRoomDto.getUserId())
                                .orElseThrow(() -> new IllegalArgumentException("User not found"));

                Room room = roomJpaRepository.findById(requestRoomDto.getRoomId())
                                .orElseThrow(() -> new IllegalArgumentException("Room not found"));

                UUID landlordId = roomJpaRepository.findLandlordByRoomId(requestRoomDto.getRoomId());
                if (landlordId == null) {
                        throw new IllegalArgumentException("Landlord not found for the room");
                }

                int status = 0;
                Requirement request = new Requirement(requestRoomDto.getDescription(), status, room, user);

                if (image != null && !image.isEmpty() && isImageFile(image)) {
                        Map<String, String> uploadResult = cloudinaryService.uploadFile(image);
                        request.setImageUrl(uploadResult.get("url"));
                        request.setImagePublicId(uploadResult.get("publicId"));
                }

                Requirement savedRequirement = requirementJpaRepository.save(request);

                requestRoomDto.setIdRequirement(savedRequirement.getId());

                // Tạo task cho landlord
                LandlordTaskCreateDto dto = LandlordTaskCreateDto.builder()
                                .title("Requirement: " + requestRoomDto.getDescription().substring(0,
                                                Math.min(20, requestRoomDto.getDescription().length())))
                                .description(requestRoomDto.getDescription())
                                .startDate(LocalDateTime.now())
                                .dueDate(LocalDateTime.now().plusDays(7))
                                .status("PENDING")
                                .type("REQUEST")
                                .relatedEntityId(savedRequirement.getId())
                                .priority("MEDIUM")
                                .landlordId(landlordId.toString())
                                .roomId(requestRoomDto.getRoomId().toString())
                                .build();
                landlordTaskService.createTask(dto);

                if (savedRequirement.getImageUrl() != null) {
                        requestRoomDto.setImageUrl(savedRequirement.getImageUrl());
                }

                return requestRoomDto;
        }

        @Transactional
        public RequirementRequestRoomDto updateRequirementWithImage(UUID idRequirement,
                        RequirementRequestUpdateDto updateDto, MultipartFile image) {
                Requirement requirement = requirementJpaRepository.findById(idRequirement)
                                .orElseThrow(() -> new IllegalArgumentException("Requirement not found"));

                // 1. Update description
                requirement.setDescription(updateDto.getDescription());

                // 2. Update ảnh nếu có
                if (image != null && !image.isEmpty() && isImageFile(image)) {
                        // Xóa ảnh cũ nếu có
                        if (requirement.getImagePublicId() != null) {
                                cloudinaryService.deleteFile(requirement.getImagePublicId());
                        }

                        // Upload ảnh mới
                        Map<String, String> uploadResult = cloudinaryService.uploadFile(image);
                        requirement.setImageUrl(uploadResult.get("url"));
                        requirement.setImagePublicId(uploadResult.get("publicId"));
                }

                requirement.setStatus(1);
                // 3. Save requirement
                Requirement savedRequirement = requirementJpaRepository.save(requirement);
                landlordTaskJpaRepository.updateTaskStatus(savedRequirement.getId(), "COMPLETED");

                // 4. Tạo DTO để trả về
                RequirementRequestRoomDto result = new RequirementRequestRoomDto();
                result.setIdRequirement(savedRequirement.getId());
                result.setUserId(savedRequirement.getUser().getId());
                result.setRoomId(savedRequirement.getRoom().getId());
                result.setDescription(savedRequirement.getDescription());
                if (savedRequirement.getImageUrl() != null) {
                        result.setImageUrl(savedRequirement.getImageUrl());
                }

                return result;
        }

        // upload image
        public boolean uploadRequirementImage(UUID idRequirement, MultipartFile image) {
                try {
                        Requirement requirement = requirementJpaRepository.findById(idRequirement)
                                        .orElseThrow(() -> new IllegalArgumentException("Requirement not found"));
                        // Kiểm tra file có phải ảnh không
                        if (image.isEmpty() || !isImageFile(image)) {
                                throw new IllegalArgumentException("Invalid image file");
                        }
                        // Xóa ảnh cũ nếu có
                        if (requirement.getImagePublicId() != null) {
                                cloudinaryService.deleteFile(requirement.getImagePublicId());
                        }
                        // Upload ảnh mới lên Cloudinary
                        Map<String, String> uploadResult = cloudinaryService.uploadFile(image);
                        // Cập nhật thông tin ảnh vào database
                        requirement.setImageUrl(uploadResult.get("url"));
                        requirement.setImagePublicId(uploadResult.get("publicId"));
                        requirementJpaRepository.save(requirement);

                        return true;
                } catch (Exception e) {
                        throw new RuntimeException("Failed to upload image: " + e.getMessage(), e);
                }
        }

        private boolean isImageFile(MultipartFile file) {
                String contentType = file.getContentType();
                return contentType != null && contentType.startsWith("image/");
        }
        ////

        private String formatHexToUuid(String hex) {
                return hex.replaceFirst(
                                "(\\w{8})(\\w{4})(\\w{4})(\\w{4})(\\w{12})",
                                "$1-$2-$3-$4-$5");
        }

        public RequirementPaging<RequirementLandlordResponseDto> getAllRequestsForLandlord(UUID landlordId, int page,
                        int size) {
                Pageable pageable = PageRequest.of(page, size);
                Page<RequirementLandLordProjection> pageResult = requirementJpaRepository
                                .findRequirmentsByLandlordId(landlordId, pageable);
                List<RequirementLandlordResponseDto> data = pageResult.getContent().stream()
                                .map(req -> RequirementLandlordResponseDto.builder()
                                                .id(UUID.fromString(formatHexToUuid(req.getId())))
                                                .roomTitle(req.getRoomTitle())
                                                .userId(UUID.fromString(formatHexToUuid(req.getUserId())))
                                                .roomId(UUID.fromString(formatHexToUuid(req.getRoomId())))
                                                .userName(req.getUserName())
                                                .email(req.getEmail())
                                                .description(req.getDescription())
                                                .status(req.getStatus())
                                                .imageUrl(req.getImageUrl())
                                                .createdDate(req.getCreatedDate())
                                                .build())
                                .collect(Collectors.toList());

                return RequirementPaging.<RequirementLandlordResponseDto>builder()
                                .data(data)
                                .pageNumber(pageResult.getNumber())
                                .pageSize(pageResult.getSize())
                                .totalRecords(pageResult.getTotalElements())
                                .totalPages(pageResult.getTotalPages())
                                .hasNext(pageResult.hasNext())
                                .hasPrevious(pageResult.hasPrevious())
                                .build();
        }

        public RequirementPaging<RequirementUserResponseDto> getAllRequestsForUser(UUID userId, int page,
                        int size) {
                Pageable pageable = PageRequest.of(page, size);
                Page<RequirementUserProjection> pageResult = requirementJpaRepository
                                .findRequirmentsByUserId(userId, pageable);
                List<RequirementUserResponseDto> data = pageResult.getContent().stream()
                                .map(req -> RequirementUserResponseDto.builder()
                                                .id(UUID.fromString(formatHexToUuid(req.getId())))
                                                .roomTitle(req.getRoomTitle())
                                                .userId(UUID.fromString(formatHexToUuid(req.getUserId())))
                                                .roomId(UUID.fromString(formatHexToUuid(req.getRoomId())))
                                                .userName(req.getUserName())
                                                .email(req.getEmail())
                                                .description(req.getDescription())
                                                .status(req.getStatus())
                                                .imageUrl(req.getImageUrl())
                                                .createdDate(req.getCreatedDate())
                                                .build())
                                .collect(Collectors.toList());

                return RequirementPaging.<RequirementUserResponseDto>builder()
                                .data(data)
                                .pageNumber(pageResult.getNumber())
                                .pageSize(pageResult.getSize())
                                .totalRecords(pageResult.getTotalElements())
                                .totalPages(pageResult.getTotalPages())
                                .hasNext(pageResult.hasNext())
                                .hasPrevious(pageResult.hasPrevious())
                                .build();
        }

        @Transactional
        public boolean updateRequirementStatus(UUID id) {
                int updated = requirementJpaRepository.updateRequirementStatus(id);
                landlordTaskJpaRepository.updateTaskStatus(id, "COMPLETED");
                if (updated > 0) {
                        return true;
                }
                throw new IllegalArgumentException("Requirement not found or not updated");
        }

        @Transactional
        public boolean rejectRequirement(UUID id) {
                int updated = requirementJpaRepository.rejectRequirements(id);
                landlordTaskJpaRepository.updateTaskStatus(id, "COMPLETED");

                if (updated > 0) {
                        return true;
                }
                throw new IllegalArgumentException("Requirement not found or not updated");
        }

        @Transactional
        public boolean updateRequirement(RequirementRequestUpdateDto requestUpdateDto) {
                Requirement requirement = requirementJpaRepository.findById(requestUpdateDto.getId())
                                .orElseThrow(() -> new EntityNotFoundException("Requirement not found"));

                requirement.setDescription(requestUpdateDto.getDescription());
                requirementJpaRepository.save(requirement);
                return true;
        }

}
