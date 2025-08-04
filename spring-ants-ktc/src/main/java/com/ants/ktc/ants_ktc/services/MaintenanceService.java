package com.ants.ktc.ants_ktc.services;

import com.ants.ktc.ants_ktc.dtos.manage_maintain.MaintenanceRequestDto;
import com.ants.ktc.ants_ktc.dtos.manage_maintain.MaintenanceResponseDto;
import com.ants.ktc.ants_ktc.dtos.manage_maintain.UpdateMaintenanceRequestDto;
import com.ants.ktc.ants_ktc.entities.Maintenances;
import com.ants.ktc.ants_ktc.entities.Room;
import com.ants.ktc.ants_ktc.repositories.MaintenancesRepository;
import com.ants.ktc.ants_ktc.repositories.room_mock.RoomRepository;

import lombok.RequiredArgsConstructor;

import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor // Tự động tạo constructor với các final fields
public class MaintenanceService {

    private final MaintenancesRepository maintenancesRepository;
    private final RoomRepository roomRepository; // Để kiểm tra quyền và lấy thông tin Room

    // 1. Phương thức tạo mới yêu cầu bảo trì
    // Cần landlordId để kiểm tra xem phòng có thuộc về landlord này không
    // Hoặc nếu Tenant tạo, thì cần roomId và userId của Tenant
    @Transactional
    public MaintenanceResponseDto createMaintenance(MaintenanceRequestDto request, UUID landlordId) {
        // 1. Kiểm tra sự tồn tại và quyền sở hữu của Room
        // Phương thức findByIdAndUser_IdAndIsRemoveFalse cần được định nghĩa trong
        // RoomRepository
        // Nó sẽ tìm phòng theo roomId VÀ userId của Landlord, đồng thời kiểm tra
        // isRemove=false
        Room room = roomRepository.findByIdAndUser_IdAndIsRemoveFalse(request.getRoomId(), landlordId)
                .orElseThrow(() -> new IllegalArgumentException("Room not found or unauthorized for this landlord."));

        // 2. Chuyển đổi DTO sang Entity
        Maintenances maintenance = new Maintenances();
        // ID sẽ được tự động tạo bởi BaseEntity
        maintenance.setProblem(request.getProblem());
        maintenance.setCost(request.getCost());
        maintenance.setStatus(request.getStatus());
        maintenance.setRoom(room); // Gắn đối tượng Room đã tìm được

        // 3. Lưu Entity vào database
        Maintenances savedMaintenance = maintenancesRepository.save(maintenance);

        // 4. Chuyển đổi Entity đã lưu sang Response DTO và trả về
        return convertToDto(savedMaintenance);
    }

    // 3. Phương thức cập nhật yêu cầu bảo trì

    public List<MaintenanceResponseDto> getMaintenancesByLandlord(UUID landlordId) {
        // 1. Lấy danh sách Maintenances từ Repository với JOIN FETCH Room
        // Phương thức findAllByLandlordIdWithRoom cần được định nghĩa trong
        // MaintenancesRepository
        // với @Query("SELECT m FROM Maintenances m JOIN FETCH m.room r WHERE r.user.id
        // = :userId")
        List<Maintenances> maintenances = maintenancesRepository.findAllByLandlordIdWithRoom(landlordId);

        // 2. Duyệt qua danh sách và chuyển đổi từng Entity sang Response DTO
        return maintenances.stream()
                .map(this::convertToDto) // Gọi phương thức private convertToDto
                .collect(Collectors.toList());
    }

    @Transactional
    public MaintenanceResponseDto updateMaintenance(UUID maintenanceId, UpdateMaintenanceRequestDto request,
            UUID landlordId) {
        Maintenances maintenance = maintenancesRepository.findById(maintenanceId)
                .orElseThrow(() -> new IllegalArgumentException("Maintenance request not found."));

        // 2. Kiểm tra quyền sở hữu của Landlord
        // Lấy ID của Landlord sở hữu phòng liên quan đến yêu cầu bảo trì này
        // Giả định Room.user là đối tượng User và User.id là UUID
        UUID ownerLandlordId = maintenance.getRoom().getUser().getId();
        if (!ownerLandlordId.equals(landlordId)) {
            throw new AccessDeniedException("You do not have permission to update this maintenance request.");
        }

        // 3. Cập nhật các trường từ Request DTO
        if (request.getProblem() != null) {
            maintenance.setProblem(request.getProblem());
        }
        if (request.getCost() != null) {
            maintenance.setCost(request.getCost());
        }
        // Trạng thái luôn là bắt buộc khi cập nhật (do @NotNull trong
        // MaintenanceUpdateRequest)
        maintenance.setStatus(request.getStatus());

        // 4. Lưu Entity đã cập nhật
        Maintenances updatedMaintenance = maintenancesRepository.save(maintenance);

        // 5. Chuyển đổi Entity đã cập nhật sang Response DTO và trả về
        return convertToDto(updatedMaintenance);
    }

    // Phương thức private để chuyển đổi Entity sang Response DTO
    private MaintenanceResponseDto convertToDto(Maintenances maintenance) {
        MaintenanceResponseDto dto = new MaintenanceResponseDto();
        dto.setId(maintenance.getId());
        dto.setProblem(maintenance.getProblem());
        dto.setCost(maintenance.getCost());
        dto.setCreatedDate(maintenance.getCreatedDate());
        dto.setModifiedDate(maintenance.getModifiedDate());

        // Chuyển đổi trạng thái số sang chuỗi hiển thị
        switch (maintenance.getStatus()) {
            case 0:
                dto.setStatus("Pending");
                break;
            case 1:
                dto.setStatus("In Progress");
                break;
            case 2:
                dto.setStatus("Completed");
                break;
            default:
                dto.setStatus("Unknown");
        }

        // Lấy thông tin Room và Address để điền vào DTO
        // Kiểm tra null cho room và address để tránh NullPointerException nếu mối quan
        // hệ chưa được tải hoặc không tồn tại
        if (maintenance.getRoom() != null && maintenance.getRoom().getAddress() != null) {
            StringBuilder fullAddressBuilder = new StringBuilder();
            fullAddressBuilder.append(maintenance.getRoom().getAddress().getStreet()); // Lấy tên đường

            // Lấy thông tin Ward, District, Province từ Address Entity
            // Cần đảm bảo Ward, District, Province Entity có trường 'name' và có các getter
            // tương ứng (getName())
            if (maintenance.getRoom().getAddress().getWard() != null) {
                fullAddressBuilder.append(", ").append(maintenance.getRoom().getAddress().getWard().getName());

                if (maintenance.getRoom().getAddress().getWard().getDistrict() != null) {
                    fullAddressBuilder.append(", ")
                            .append(maintenance.getRoom().getAddress().getWard().getDistrict().getName());

                    if (maintenance.getRoom().getAddress().getWard().getDistrict().getProvince() != null) {
                        fullAddressBuilder.append(", ").append(
                                maintenance.getRoom().getAddress().getWard().getDistrict().getProvince().getName());
                    }
                }
            }
            dto.setRoomAddress(fullAddressBuilder.toString());
        }
        return dto;
    }
}