
package com.ants.ktc.ants_ktc.controllers.landlord;

import com.ants.ktc.ants_ktc.dtos.manage_maintain.MaintenanceRequestDto;
import com.ants.ktc.ants_ktc.dtos.manage_maintain.MaintenanceResponseDto;
import com.ants.ktc.ants_ktc.dtos.manage_maintain.PaginatedMaintenanceResponseDto;
import com.ants.ktc.ants_ktc.dtos.manage_maintain.UpdateMaintenanceRequestDto;
import com.ants.ktc.ants_ktc.repositories.RoomNameProjection;
import com.ants.ktc.ants_ktc.services.MaintenanceService;
import com.ants.ktc.ants_ktc.services.UserService;

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

    @Autowired
    private UserService userService;

    @GetMapping("/rooms")
    public ResponseEntity<List<RoomNameProjection>> getLandlordRoomsForMaintenance() {
        UUID currentUserId = userService.getAuthenticatedUserId();
        List<RoomNameProjection> rooms = maintenanceService.getRoomsForLandlord(currentUserId);
        return ResponseEntity.ok(rooms);
    }

    @PostMapping
    public ResponseEntity<MaintenanceResponseDto> createMaintenance(
            @Valid @RequestBody MaintenanceRequestDto maintenanceRequestDto) {
        UUID currentUserId = userService.getAuthenticatedUserId();
        MaintenanceResponseDto newMaintenance = maintenanceService.createMaintenance(currentUserId,
                maintenanceRequestDto);
        return ResponseEntity.status(201).body(newMaintenance);
    }

    @GetMapping
    public ResponseEntity<PaginatedMaintenanceResponseDto<MaintenanceResponseDto>> getLandlordMaintenances(
            @RequestParam(name = "page", defaultValue = "0") int page,
            @RequestParam(name = "size", defaultValue = "7") int size,
            @RequestParam(name = "status", required = false) Integer status,
            @RequestParam(name = "roomId", required = false) UUID roomId) {
        UUID currentUserId = userService.getAuthenticatedUserId();
        PaginatedMaintenanceResponseDto<MaintenanceResponseDto> maintenances = maintenanceService
                .getLandlordMaintenances(
                        currentUserId, status, roomId, page, size);
        return ResponseEntity.ok(maintenances);
    }

    @PatchMapping("/{id}")
    public ResponseEntity<MaintenanceResponseDto> updateMaintenance(
            @PathVariable("id") UUID id,
            @Valid @RequestBody UpdateMaintenanceRequestDto updateDto) {
        UUID currentUserId = userService.getAuthenticatedUserId();
        MaintenanceResponseDto updatedMaintenance = maintenanceService.updateMaintenance(currentUserId, id, updateDto);
        return ResponseEntity.ok(updatedMaintenance);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteMaintenance(@PathVariable("id") UUID id) {
        UUID currentUserId = userService.getAuthenticatedUserId();
        maintenanceService.deleteMaintenance(currentUserId, id);
        return new ResponseEntity<>(HttpStatus.NO_CONTENT);
    }
}