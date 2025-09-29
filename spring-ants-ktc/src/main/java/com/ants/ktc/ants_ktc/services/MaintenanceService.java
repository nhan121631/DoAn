package com.ants.ktc.ants_ktc.services;

import com.ants.ktc.ants_ktc.dtos.LandlordTask.LandlordTaskCreateDto;
import com.ants.ktc.ants_ktc.dtos.manage_maintain.MaintenanceRequestDto;
import com.ants.ktc.ants_ktc.dtos.manage_maintain.MaintenanceResponseDto;
import com.ants.ktc.ants_ktc.dtos.manage_maintain.PaginatedMaintenanceResponseDto;
import com.ants.ktc.ants_ktc.dtos.manage_maintain.RoomDetailForMaintenanceDto;
import com.ants.ktc.ants_ktc.dtos.manage_maintain.UpdateMaintenanceRequestDto;
import com.ants.ktc.ants_ktc.entities.Maintenances;
import com.ants.ktc.ants_ktc.entities.Room;
import com.ants.ktc.ants_ktc.repositories.LandlordTaskJpaRepository;
import com.ants.ktc.ants_ktc.repositories.MaintenancesRepository;
import com.ants.ktc.ants_ktc.repositories.RoomJpaRepository;
import com.ants.ktc.ants_ktc.repositories.RoomNameProjection;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class MaintenanceService {

        @Autowired
        private MaintenancesRepository maintenancesRepository;

        @Autowired
        private RoomJpaRepository roomJpaRepository;

        @Autowired
        private LandlordTaskService landlordTaskService;

        @Autowired
        private LandlordTaskJpaRepository landlordTaskJpaRepository;

        @Transactional
        public MaintenanceResponseDto createMaintenance(UUID userId, MaintenanceRequestDto requestDto) {
                Room room = roomJpaRepository.findActiveRoomByIdAndUserId(requestDto.getRoomId(), userId)
                                .orElseThrow(() -> new IllegalArgumentException(
                                                "Room not found or does not belong to the current landlord."));

                Maintenances maintenance = new Maintenances();
                maintenance.setProblem(requestDto.getProblem());
                maintenance.setCost(requestDto.getCost());
                maintenance.setStatus(0);
                maintenance.setRoom(room);

                Maintenances savedMaintenance = maintenancesRepository.save(maintenance);
                // Create a corresponding LandlordTask for the maintenance request
                LandlordTaskCreateDto dto = LandlordTaskCreateDto.builder()
                                .title("Maintenance: " + requestDto.getProblem().substring(0,
                                                Math.min(20, requestDto.getProblem().length())))
                                .description(requestDto.getProblem())
                                .startDate(LocalDateTime.now())
                                .dueDate(LocalDateTime.now().plusDays(7))
                                .status("PENDING")
                                .type("MAINTENANCE")
                                .relatedEntityId(savedMaintenance.getId())
                                .priority("MEDIUM")
                                .landlordId(userId.toString())
                                .roomId(requestDto.getRoomId().toString())
                                .build();
                landlordTaskService.createTask(dto);

                return convertToMaintenanceResponseDto(savedMaintenance);
        }

        @Transactional(readOnly = true)
        public List<RoomNameProjection> getRoomsForLandlord(UUID userId) {
                return roomJpaRepository.findActiveRoomsByUserId(userId);
        }

        @Transactional(readOnly = true)
        public PaginatedMaintenanceResponseDto<MaintenanceResponseDto> getLandlordMaintenances(
                        UUID userId, Integer status, UUID roomId, int page, int size) {

                Pageable pageable = PageRequest.of(page, size, Sort.by("createdDate").descending());

                // Gọi phương thức repository đã được tối ưu hóa
                Page<Maintenances> maintenances = maintenancesRepository.findMaintenanceRequestsByCriteria(
                                userId, status, roomId, pageable);

                List<MaintenanceResponseDto> dtoList = maintenances.getContent().stream()
                                .map(this::convertToMaintenanceResponseDto)
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
                                .findActiveByIdAndUserId(id, userId)
                                .orElseThrow(() -> new IllegalArgumentException(
                                                "Maintenance not found or does not belong to the current landlord."));

                existingMaintenance.setProblem(requestDto.getProblem());
                existingMaintenance.setCost(requestDto.getCost());
                existingMaintenance.setStatus(requestDto.getStatus());
                if (Integer.valueOf(2).equals(requestDto.getStatus())) { // If status is COMPLETED
                        landlordTaskJpaRepository.updateTaskStatus(id, "COMPLETED");
                }

                Maintenances updatedMaintenance = maintenancesRepository.save(existingMaintenance);

                return convertToMaintenanceResponseDto(updatedMaintenance);
        }

        @Transactional
        public void deleteMaintenance(UUID userId, UUID maintenanceId) {
                Maintenances maintenance = maintenancesRepository
                                .findActiveByIdAndUserId(maintenanceId, userId)
                                .orElseThrow(() -> new IllegalArgumentException(
                                                "Maintenance not found or not owned by this landlord."));

                maintenance.setRemoved(true);
                maintenancesRepository.save(maintenance);
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
