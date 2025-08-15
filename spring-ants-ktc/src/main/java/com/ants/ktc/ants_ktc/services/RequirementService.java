package com.ants.ktc.ants_ktc.services;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import com.ants.ktc.ants_ktc.dtos.requirement.RequirementLandlordResponseDto;
import com.ants.ktc.ants_ktc.dtos.requirement.RequirementPaging;
import com.ants.ktc.ants_ktc.dtos.requirement.RequirementRequestRoomDto;
import com.ants.ktc.ants_ktc.dtos.requirement.RequirementRequestUpdateDto;
import com.ants.ktc.ants_ktc.dtos.requirement.RequirementUserResponseDto;
import com.ants.ktc.ants_ktc.entities.Requirement;
import com.ants.ktc.ants_ktc.entities.Room;
import com.ants.ktc.ants_ktc.entities.User;
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

        public boolean createRequestRoom(RequirementRequestRoomDto requestRoomDto) {
                User user = userJpaRepository.findById(requestRoomDto.getUserId())
                                .orElseThrow(
                                                () -> new IllegalArgumentException("User not found"));

                Room room = roomJpaRepository.findById(requestRoomDto.getRoomId())
                                .orElseThrow(
                                                () -> new IllegalArgumentException("Room not found"));
                int status = 0;
                Requirement request = new Requirement(requestRoomDto.getDescription(), status, room, user);
                requirementJpaRepository.save(request);

                return true;
        }

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
                                                .userName(req.getUserName())
                                                .email(req.getEmail())
                                                .description(req.getDescription())
                                                .status(req.getStatus())
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
                                                .userName(req.getUserName())
                                                .email(req.getEmail())
                                                .description(req.getDescription())
                                                .status(req.getStatus())
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
                if (updated > 0) {
                        return true;
                }
                throw new IllegalArgumentException("Requirement not found or not updated");
        }

        @Transactional
        public boolean rejectRequirement(UUID id) {
                int updated = requirementJpaRepository.rejectRequirements(id);
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
