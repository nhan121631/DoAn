package com.ants.ktc.ants_ktc.services;

import com.ants.ktc.ants_ktc.dtos.manage_maintain.MaintenanceRequestDto;
import com.ants.ktc.ants_ktc.dtos.manage_maintain.MaintenanceResponseDto;
import com.ants.ktc.ants_ktc.dtos.manage_maintain.UpdateMaintenanceRequestDto;
import com.ants.ktc.ants_ktc.dtos.room.RoomResponseDto;

import com.ants.ktc.ants_ktc.entities.Maintenances;
import com.ants.ktc.ants_ktc.entities.Room;
import com.ants.ktc.ants_ktc.repositories.MaintenancesRepository;
import com.ants.ktc.ants_ktc.repositories.RoomJpaRepository;
import com.ants.ktc.ants_ktc.repositories.RoomNameProjection; // <-- SỬA import
import com.ants.ktc.ants_ktc.entities.User;

import org.springframework.beans.factory.annotation.Autowired;
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

    private RoomResponseDto convertToRoomResponseDto(Room room) {
        RoomResponseDto dto = RoomResponseDto.builder()
                .id(room.getId())
                .title(room.getTitle())
                .description(room.getDescription())
                .priceMonth(room.getPrice_month())
                .priceDeposit(room.getPrice_deposit())
                .postStartDate(room.getPost_start_date())
                .postEndDate(room.getPost_end_date())
                .userId(room.getUser() != null ? room.getUser().getId() : null)
                .typepost(room.getPostType() != null ? room.getPostType().getName() : null)
                .build();

        return dto;
    }

    @Transactional
    public MaintenanceResponseDto createMaintenance(UUID userId, MaintenanceRequestDto requestDto) {
        Room room = roomJpaRepository.findById(requestDto.getRoomId())
                .orElseThrow(() -> new IllegalArgumentException("Room not found with ID: " + requestDto.getRoomId()));

        if (!room.getUser().getId().equals(userId)) {
            throw new IllegalArgumentException("Room does not belong to the current landlord.");
        }

        Maintenances maintenance = new Maintenances();
        maintenance.setProblem(requestDto.getProblem());
        maintenance.setCost(requestDto.getCost());
        maintenance.setStatus(0);
        maintenance.setRoom(room);

        Maintenances savedMaintenance = maintenancesRepository.save(maintenance);

        return convertToMaintenanceResponseDto(savedMaintenance);
    }

    // Hàm lấy danh sách phòng (đã sửa)
    @Transactional(readOnly = true)
    public List<RoomNameProjection> getRoomsForLandlord(UUID userId) {
        return roomJpaRepository.findByUserIdAndIsRemovedFalse(userId);
    }

    // Hàm lấy danh sách yêu cầu bảo trì (đã sửa)
    @Transactional(readOnly = true)
    public List<MaintenanceResponseDto> getLandlordMaintenances(UUID userId, Integer status, UUID roomId) {
        List<Maintenances> maintenances;

        if (status != null && roomId != null) {
            maintenances = maintenancesRepository.findByRoom_UserIdAndStatusAndRoom_IdAndIsRemovedFalse(userId, status,
                    roomId);
        } else if (status != null) {
            maintenances = maintenancesRepository.findByRoom_UserIdAndStatusAndIsRemovedFalse(userId, status);
        } else if (roomId != null) {
            maintenances = maintenancesRepository.findByRoom_UserIdAndRoom_IdAndIsRemovedFalse(userId, roomId);
        } else {
            maintenances = maintenancesRepository.findByRoom_UserIdAndIsRemovedFalse(userId);
        }

        return maintenances.stream()
                .map(this::convertToMaintenanceResponseDto)
                .collect(Collectors.toList());
    }

    @Transactional
    public MaintenanceResponseDto updateMaintenance(UUID userId, UUID id, UpdateMaintenanceRequestDto requestDto) {
        Maintenances existingMaintenance = maintenancesRepository.findByIdAndRoom_UserId(id, userId)
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
        Maintenances maintenance = maintenancesRepository.findByIdAndRoom_UserIdAndIsRemovedFalse(maintenanceId, userId)
                .orElseThrow(
                        () -> new IllegalArgumentException("Maintenance not found or not owned by this landlord."));

        maintenance.setRemoved(true);

        maintenancesRepository.save(maintenance);
    }

    private MaintenanceResponseDto convertToMaintenanceResponseDto(Maintenances maintenance) {
        return MaintenanceResponseDto.builder()
                .id(maintenance.getId())
                .problem(maintenance.getProblem())
                .cost(maintenance.getCost())
                .status(maintenance.getStatus())
                .requestDate(maintenance.getCreatedDate())
                .room(convertToRoomResponseDto(maintenance.getRoom()))
                .build();
    }
}