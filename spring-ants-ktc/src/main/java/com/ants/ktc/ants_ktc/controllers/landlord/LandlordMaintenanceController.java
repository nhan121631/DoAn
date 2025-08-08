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
    // @GetMapping("/rooms")
    // public ResponseEntity<List<RoomResponseDto>> getLandlordRoomsForMaintenance()
    // {
    // UUID currentUserId = userService.getAuthenticatedUserId(); // <== GỌI TỪ
    // SERVICE
    // List<RoomResponseDto> rooms =
    // maintenanceService.getRoomsForLandlord(currentUserId);
    // return ResponseEntity.ok(rooms);
    // }

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
