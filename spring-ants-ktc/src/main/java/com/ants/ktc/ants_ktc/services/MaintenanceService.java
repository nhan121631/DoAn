package com.ants.ktc.ants_ktc.services;

import com.ants.ktc.ants_ktc.dtos.manage_maintain.MaintenanceRequestDto;
import com.ants.ktc.ants_ktc.dtos.manage_maintain.MaintenanceResponseDto;
import com.ants.ktc.ants_ktc.dtos.manage_maintain.PaginatedMaintenanceResponseDto;
import com.ants.ktc.ants_ktc.dtos.manage_maintain.RoomDetailForMaintenanceDto;
import com.ants.ktc.ants_ktc.dtos.manage_maintain.UpdateMaintenanceRequestDto;
import com.ants.ktc.ants_ktc.entities.Maintenances;
import com.ants.ktc.ants_ktc.entities.Room;
import com.ants.ktc.ants_ktc.repositories.MaintenanceProjection;
import com.ants.ktc.ants_ktc.repositories.MaintenancesRepository;
import com.ants.ktc.ants_ktc.repositories.RoomJpaRepository;
import com.ants.ktc.ants_ktc.repositories.RoomNameProjection;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class MaintenanceService {

        @Autowired
        private MaintenancesRepository maintenancesRepository;

        @Autowired
        private RoomJpaRepository roomJpaRepository;

        @Transactional
        public MaintenanceResponseDto createMaintenance(UUID userId, MaintenanceRequestDto requestDto) {
                Room room = roomJpaRepository.findByIdAndUserIdAndIsRemovedFalse(requestDto.getRoomId(), userId)
                                .orElseThrow(() -> new IllegalArgumentException(
                                                "Room not found or does not belong to the current landlord."));

                Maintenances maintenance = new Maintenances();
                maintenance.setProblem(requestDto.getProblem());
                maintenance.setCost(requestDto.getCost());
                maintenance.setStatus(0);
                maintenance.setRoom(room);

                Maintenances savedMaintenance = maintenancesRepository.save(maintenance);

                return convertToMaintenanceResponseDto(savedMaintenance);
        }

        @Transactional(readOnly = true)
        public List<RoomNameProjection> getRoomsForLandlord(UUID userId) {
                return roomJpaRepository.findByUserIdAndIsRemovedFalse(userId);
        }

        @Transactional(readOnly = true)
        public PaginatedMaintenanceResponseDto<MaintenanceResponseDto> getLandlordMaintenances(
                        UUID userId, Integer status, UUID roomId, int page, int size) {

                Pageable pageable = PageRequest.of(page, size, Sort.by("createdDate").descending());
                Page<MaintenanceProjection> maintenances;

                if (status != null && roomId != null) {
                        maintenances = maintenancesRepository
                                        .findByRoom_UserIdAndStatusAndRoom_IdAndIsRemovedFalse(userId, status, roomId,
                                                        pageable);
                } else if (status != null) {
                        maintenances = maintenancesRepository
                                        .findByRoom_UserIdAndStatusAndIsRemovedFalse(userId, status, pageable);
                } else if (roomId != null) {
                        maintenances = maintenancesRepository
                                        .findByRoom_UserIdAndRoom_IdAndIsRemovedFalse(userId, roomId, pageable);
                } else {
                        maintenances = maintenancesRepository
                                        .findByRoom_UserIdAndIsRemovedFalse(userId, pageable);
                }

                List<MaintenanceResponseDto> dtoList = maintenances.getContent().stream()
                                .map(this::convertToMaintenanceResponseDtoFromProjection)
                                .collect(Collectors.toList());

                return new PaginatedMaintenanceResponseDto<>(
                                dtoList,
                                page,
                                size,
                                maintenances.getTotalElements(),
                                maintenances.getTotalPages(),
                                maintenances.hasNext(),
                                maintenances.hasPrevious());
        }

        @Transactional
        public MaintenanceResponseDto updateMaintenance(UUID userId, UUID id, UpdateMaintenanceRequestDto requestDto) {
                Maintenances existingMaintenance = maintenancesRepository
                                .findByIdAndRoom_UserIdAndIsRemovedFalse(id, userId)
                                .orElseThrow(() -> new IllegalArgumentException(
                                                "Maintenance not found or does not belong to the current landlord."));

                existingMaintenance.setProblem(requestDto.getProblem());
                existingMaintenance.setCost(requestDto.getCost());
                existingMaintenance.setStatus(requestDto.getStatus());

                Maintenances updatedMaintenance = maintenancesRepository.save(existingMaintenance);

                return convertToMaintenanceResponseDto(updatedMaintenance);
        }

        @Transactional
        public void deleteMaintenance(UUID userId, UUID maintenanceId) {
                Maintenances maintenance = maintenancesRepository
                                .findByIdAndRoom_UserIdAndIsRemovedFalse(maintenanceId, userId)
                                .orElseThrow(() -> new IllegalArgumentException(
                                                "Maintenance not found or not owned by this landlord."));

                maintenance.setRemoved(true);
                maintenancesRepository.save(maintenance);
        }

        private MaintenanceResponseDto convertToMaintenanceResponseDtoFromProjection(MaintenanceProjection projection) {
                RoomDetailForMaintenanceDto roomDto = RoomDetailForMaintenanceDto.builder()
                                .id(projection.getRoom().getId())
                                .title(projection.getRoom().getTitle())
                                .build();

                return MaintenanceResponseDto.builder()
                                .id(projection.getId())
                                .problem(projection.getProblem())
                                .cost(projection.getCost())
                                .status(projection.getStatus())
                                .requestDate(new java.util.Date(projection.getCreatedDate().getTime()))
                                .room(roomDto)
                                .build();
        }

        private MaintenanceResponseDto convertToMaintenanceResponseDto(Maintenances maintenance) {
                RoomDetailForMaintenanceDto roomDto = RoomDetailForMaintenanceDto.builder()
                                .id(maintenance.getRoom().getId())
                                .title(maintenance.getRoom().getTitle())
                                .build();

                return MaintenanceResponseDto.builder()
                                .id(maintenance.getId())
                                .problem(maintenance.getProblem())
                                .cost(maintenance.getCost())
                                .status(maintenance.getStatus())
                                .requestDate(maintenance.getCreatedDate())
                                .room(roomDto)
                                .build();
        }
}
