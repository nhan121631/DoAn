// package com.ants.ktc.ants_ktc.controllers.landlord;

// import lombok.RequiredArgsConstructor;
// import org.springframework.http.HttpStatus;
// import org.springframework.http.ResponseEntity;
// import org.springframework.security.core.annotation.AuthenticationPrincipal;
// import org.springframework.security.core.userdetails.UserDetails;

// import jakarta.validation.Valid;
// import org.springframework.web.bind.annotation.*;

// import com.ants.ktc.ants_ktc.dtos.manage_maintain.MaintenanceRequestDto;
// import com.ants.ktc.ants_ktc.dtos.manage_maintain.MaintenanceResponseDto;
// import com.ants.ktc.ants_ktc.dtos.manage_maintain.RoomResponseDto;
// import
// com.ants.ktc.ants_ktc.dtos.manage_maintain.UpdateMaintenanceRequestDto;
// import com.ants.ktc.ants_ktc.services.MaintenanceService;
// import com.ants.ktc.ants_ktc.services.room_mock.RoomService;

// import java.util.List;
// import java.util.UUID;

// @RestController
// @RequestMapping("/api/landlord/maintenances")
// @RequiredArgsConstructor
// public class LandlordMaintenanceController {

// private final MaintenanceService maintenanceService;
// private final RoomService roomService;

// // Giả định bạn có một cách để lấy User ID (UUID) từ principal/Authentication
// // Ví dụ về một interface đơn giản cho CustomUserDetails để lấy UUID
// public interface CustomUserDetails {
// UUID getId(); // Phương thức để lấy ID của người dùng đang đăng nhập
// // ... các phương thức khác của UserDetails
// }

// /**
// * POST /api/landlord/maintenances
// * Tạo một yêu cầu bảo trì mới.
// *
// * @param request DTO chứa thông tin yêu cầu bảo trì.
// * @param currentUser Thông tin người dùng đang đăng nhập (Landlord).
// * @return ResponseEntity với MaintenanceResponse và HttpStatus.CREATED.
// */
// @PostMapping
// public ResponseEntity<MaintenanceResponseDto> createMaintenance(
// @Valid @RequestBody MaintenanceRequestDto request,
// @AuthenticationPrincipal CustomUserDetails currentUser) {
// // Lấy ID của Landlord từ thông tin người dùng đang đăng nhập
// UUID landlordId = currentUser.getId();
// MaintenanceResponseDto response =
// maintenanceService.createMaintenance(request, landlordId);
// return new ResponseEntity<>(response, HttpStatus.CREATED);
// }

// /**
// * GET /api/landlord/maintenances
// * Lấy tất cả các yêu cầu bảo trì của Landlord đang đăng nhập.
// *
// * @param currentUser Thông tin người dùng đang đăng nhập (Landlord).
// * @return ResponseEntity với danh sách MaintenanceResponse và HttpStatus.OK.
// */
// @GetMapping("/rooms") // <== API endpoint mới
// public ResponseEntity<List<RoomResponseDto>> getLandlordRooms(
// @AuthenticationPrincipal UserDetails currentUser) {
// String username = currentUser.getUsername();
// List<RoomResponseDto> responses = roomService.getRoomsByLandlord(username);
// return new ResponseEntity<>(responses, HttpStatus.OK);
// }

// /**
// * PUT /api/landlord/maintenances/{id}
// * Cập nhật một yêu cầu bảo trì cụ thể.
// *
// * @param id ID của yêu cầu bảo trì cần cập nhật.
// * @param request DTO chứa thông tin cập nhật.
// * @param currentUser Thông tin người dùng đang đăng nhập (Landlord).
// * @return ResponseEntity với MaintenanceResponse đã cập nhật và
// HttpStatus.OK.
// */
// @PutMapping("/{id}")
// public ResponseEntity<MaintenanceResponseDto> updateMaintenance(
// @PathVariable("id") UUID id,
// @Valid @RequestBody UpdateMaintenanceRequestDto request,
// @AuthenticationPrincipal CustomUserDetails currentUser) {
// // Lấy ID của Landlord từ thông tin người dùng đang đăng nhập
// UUID landlordId = currentUser.getId();
// MaintenanceResponseDto response = maintenanceService.updateMaintenance(id,
// request, landlordId);
// return new ResponseEntity<>(response, HttpStatus.OK);
// }
// }

// File: src/main/java/com/ants/ktc/ants_ktc/controllers/landlord/LandlordMaintenanceController.java
package com.ants.ktc.ants_ktc.controllers.landlord;

import com.ants.ktc.ants_ktc.dtos.manage_maintain.MaintenanceRequestDto;
import com.ants.ktc.ants_ktc.dtos.manage_maintain.MaintenanceResponseDto;
import com.ants.ktc.ants_ktc.dtos.manage_maintain.UpdateMaintenanceRequestDto;
import com.ants.ktc.ants_ktc.dtos.room.RoomResponseDto;
import com.ants.ktc.ants_ktc.services.MaintenanceService;

import com.ants.ktc.ants_ktc.services.UserService; // <== ĐẢM BẢO CÓ DÒNG IMPORT NÀY

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/landlord/maintenances")
public class LandlordMaintenanceController {

    @Autowired
    private MaintenanceService maintenanceService;

    @Autowired // <== THAY THẾ @Autowired private UserJpaRepository userJpaRepository; bằng
               // dòng này
    private UserService userService; // <== Inject UserService vào đây

    // Các API khác của bạn sẽ được chỉnh sửa để gọi
    // userService.getAuthenticatedUserId()
    @GetMapping("/rooms")
    public ResponseEntity<List<RoomResponseDto>> getLandlordRoomsForMaintenance() {
        UUID currentUserId = userService.getAuthenticatedUserId(); // <== GỌI TỪ SERVICE
        List<RoomResponseDto> rooms = maintenanceService.getRoomsForLandlord(currentUserId);
        return ResponseEntity.ok(rooms);
    }

    @PostMapping
    public ResponseEntity<MaintenanceResponseDto> createMaintenance(
            @Valid @RequestBody MaintenanceRequestDto maintenanceRequestDto) {
        UUID currentUserId = userService.getAuthenticatedUserId(); // <== GỌI TỪ SERVICE
        MaintenanceResponseDto newMaintenance = maintenanceService.createMaintenance(currentUserId,
                maintenanceRequestDto);
        return ResponseEntity.status(201).body(newMaintenance);
    }

    @GetMapping
    public ResponseEntity<List<MaintenanceResponseDto>> getLandlordMaintenances(
            @RequestParam(required = false) Integer status,
            @RequestParam(required = false) UUID roomId) {
        UUID currentUserId = userService.getAuthenticatedUserId(); // <== GỌI TỪ SERVICE
        List<MaintenanceResponseDto> maintenances = maintenanceService.getLandlordMaintenances(currentUserId, status,
                roomId);
        return ResponseEntity.ok(maintenances);
    }

    @PatchMapping("/{id}")
    public ResponseEntity<MaintenanceResponseDto> updateMaintenance(
            @PathVariable UUID id,
            @Valid @RequestBody UpdateMaintenanceRequestDto updateDto) {
        UUID currentUserId = userService.getAuthenticatedUserId(); // <== GỌI TỪ SERVICE
        MaintenanceResponseDto updatedMaintenance = maintenanceService.updateMaintenance(currentUserId, id, updateDto);
        return ResponseEntity.ok(updatedMaintenance);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteMaintenance(@PathVariable UUID id) {
        UUID currentUserId = userService.getAuthenticatedUserId();
        maintenanceService.deleteMaintenance(currentUserId, id);
        return new ResponseEntity<>(HttpStatus.NO_CONTENT); // Trả về 204 No Content
    }
}
