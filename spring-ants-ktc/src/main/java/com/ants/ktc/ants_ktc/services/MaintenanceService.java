package com.ants.ktc.ants_ktc.services;

import com.ants.ktc.ants_ktc.dtos.manage_maintain.MaintenanceRequestDto;
import com.ants.ktc.ants_ktc.dtos.manage_maintain.MaintenanceResponseDto;
import com.ants.ktc.ants_ktc.dtos.manage_maintain.UpdateMaintenanceRequestDto;
import com.ants.ktc.ants_ktc.dtos.room.RoomResponseDto;
import com.ants.ktc.ants_ktc.dtos.address.AddressResponseDto;
import com.ants.ktc.ants_ktc.dtos.address.DistrictResponseDto;
import com.ants.ktc.ants_ktc.dtos.address.ProvinceResponseDto;
import com.ants.ktc.ants_ktc.dtos.address.WardResponseDto;
import com.ants.ktc.ants_ktc.dtos.convenient.ConvenientResponseDto;
import com.ants.ktc.ants_ktc.dtos.image.ImageResponseDto;

import com.ants.ktc.ants_ktc.entities.Maintenances;
import com.ants.ktc.ants_ktc.entities.Room;
import com.ants.ktc.ants_ktc.repositories.MaintenancesRepository;
import com.ants.ktc.ants_ktc.repositories.RoomJpaRepository;
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

    // ĐÃ SỬA: Thêm @Transactional
    // @Transactional(readOnly = true)
    // public List<RoomResponseDto> getRoomsForLandlord(UUID userId) {
    // List<Room> rooms = roomJpaRepository.findByUserId(userId);
    // return rooms.stream()
    // .map(this::convertToRoomResponseDto)
    // .collect(Collectors.toList());
    // }

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

        if (room.getAddress() != null) {
            AddressResponseDto addressDto = AddressResponseDto.builder()
                    .id(room.getAddress().getId())
                    .street(room.getAddress().getStreet())
                    .build();

            if (room.getAddress().getWard() != null) {
                WardResponseDto wardDto = WardResponseDto.builder()
                        .id(room.getAddress().getWard().getId())
                        .name(room.getAddress().getWard().getName())
                        .build();

                if (room.getAddress().getWard().getDistrict() != null) {
                    DistrictResponseDto districtDto = DistrictResponseDto.builder()
                            .id(room.getAddress().getWard().getDistrict().getId())
                            .name(room.getAddress().getWard().getDistrict().getName())
                            .build();

                    if (room.getAddress().getWard().getDistrict().getProvince() != null) {
                        ProvinceResponseDto provinceDto = ProvinceResponseDto.builder()
                                .id(room.getAddress().getWard().getDistrict().getProvince().getId())
                                .name(room.getAddress().getWard().getDistrict().getProvince().getName())
                                .build();
                        districtDto.setProvince(provinceDto);
                    }
                    wardDto.setDistrict(districtDto);
                }
                addressDto.setWard(wardDto);
            }
            dto.setAddress(addressDto);
        }

        // Dữ liệu images sẽ được tải tại đây
        if (room.getImages() != null && !room.getImages().isEmpty()) {
            dto.setImages(room.getImages().stream()
                    .map(image -> ImageResponseDto.builder()
                            .id(image.getId())
                            .url(image.getUrl())
                            .build())
                    .collect(Collectors.toList()));
        }

        // Dữ liệu convenients sẽ được tải tại đây
        if (room.getConvenients() != null && !room.getConvenients().isEmpty()) {
            dto.setConvenients(room.getConvenients().stream()
                    .map(convenient -> ConvenientResponseDto.builder()
                            .id(convenient.getId())
                            .name(convenient.getName())
                            .build())
                    .collect(Collectors.toList()));
        }
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

    // ĐÃ SỬA: Thêm @Transactional
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
        // TÌM KIẾM bản ghi trước
        Maintenances maintenance = maintenancesRepository.findByIdAndRoom_UserIdAndIsRemovedFalse(maintenanceId, userId)
                .orElseThrow(
                        () -> new IllegalArgumentException("Maintenance not found or not owned by this landlord."));

        // CẬP NHẬT trường isRemoved
        maintenance.setRemoved(true);

        // LƯU lại bản ghi đã cập nhật
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