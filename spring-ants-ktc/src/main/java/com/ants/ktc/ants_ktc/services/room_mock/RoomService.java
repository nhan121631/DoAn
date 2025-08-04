package com.ants.ktc.ants_ktc.services.room_mock;

import com.ants.ktc.ants_ktc.dtos.manage_maintain.RoomResponseDto;
import com.ants.ktc.ants_ktc.entities.Room;
import com.ants.ktc.ants_ktc.entities.User; // Import User Entity để lấy ID
import com.ants.ktc.ants_ktc.repositories.UserJpaRepository; // Import UserJpaRepository
import com.ants.ktc.ants_ktc.repositories.room_mock.RoomRepository;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class RoomService { // <== Tạo RoomService mới

    private final RoomRepository roomRepository;
    private final UserJpaRepository userJpaRepository; // Inject UserJpaRepository để lấy landlordId

    /**
     * Lấy danh sách tất cả các phòng thuộc về một Landlord cụ thể.
     *
     * @param username Tên đăng nhập của Landlord.
     * @return Danh sách RoomResponse DTO.
     * @throws ResourceNotFoundException nếu Landlord không tìm thấy.
     */
    public List<RoomResponseDto> getRoomsByLandlord(String username) {
        // Lấy User Entity từ username để có được ID của Landlord
        User landlord = userJpaRepository.findByUsername(username)
                .orElseThrow(() -> new IllegalArgumentException("Landlord not found with username: " + username));
        UUID landlordId = landlord.getId();

        // Lấy danh sách các phòng từ repository
        List<Room> rooms = roomRepository.findAllByUser_IdAndIsRemoveFalse(landlordId);

        // Chuyển đổi từ Room Entity sang RoomResponse DTO
        return rooms.stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    // Phương thức helper để chuyển đổi Room Entity sang RoomResponse DTO
    private RoomResponseDto convertToDto(Room room) {
        RoomResponseDto dto = new RoomResponseDto();
        dto.setId(room.getId());
        dto.setName(room.getTitle());
        // dto.setRoomCode(room.getRoomCode());
        // dto.setArea(room.getArea());
        // dto.setNumberOfBeds(room.getNumberOfBeds());
        // Thêm các trường khác nếu cần

        // Xây dựng địa chỉ đầy đủ giống như trong MaintenanceService
        if (room.getAddress() != null) {
            StringBuilder fullAddressBuilder = new StringBuilder();
            fullAddressBuilder.append(room.getAddress().getStreet());

            if (room.getAddress().getWard() != null) {
                fullAddressBuilder.append(", ").append(room.getAddress().getWard().getName());

                if (room.getAddress().getWard().getDistrict() != null) {
                    fullAddressBuilder.append(", ").append(room.getAddress().getWard().getDistrict().getName());

                    if (room.getAddress().getWard().getDistrict().getProvince() != null) {
                        fullAddressBuilder.append(", ")
                                .append(room.getAddress().getWard().getDistrict().getProvince().getName());
                    }
                }
            }
            dto.setRoomAddress(fullAddressBuilder.toString());
        }
        return dto;
    }
}