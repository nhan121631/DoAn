package com.ants.ktc.ants_ktc.controllers;

import java.io.IOException;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.ants.ktc.ants_ktc.dtos.filters.FilterRoomRequestDto;
import com.ants.ktc.ants_ktc.dtos.room.PaginationRoomAdminResponseDto;
import com.ants.ktc.ants_ktc.dtos.room.PaginationRoomInUserResponseDto;
import com.ants.ktc.ants_ktc.dtos.room.PaginationRoomResponseDto;
import com.ants.ktc.ants_ktc.dtos.room.RoomApprovalProjectionDto;
import com.ants.ktc.ants_ktc.dtos.room.RoomDeleteRequestDto;
import com.ants.ktc.ants_ktc.dtos.room.RoomRequestCreateDto;
import com.ants.ktc.ants_ktc.dtos.room.RoomRequestUpdateDto;
import com.ants.ktc.ants_ktc.dtos.room.RoomResponseDto;
import com.ants.ktc.ants_ktc.dtos.room.RoomShowHideProjectionDto;
import com.ants.ktc.ants_ktc.dtos.room.RoomUpdateExpireDateRequestDto;
import com.ants.ktc.ants_ktc.dtos.room.RoomUpdateExpireDateResponseDto;
import com.ants.ktc.ants_ktc.services.RoomService;
import com.fasterxml.jackson.databind.ObjectMapper;

import jakarta.validation.ConstraintViolation;
import jakarta.validation.Valid;
import jakarta.validation.Validator;

@RestController
@RequestMapping("/api/rooms")
public class RoomController {
    @Autowired
    private RoomService roomService;
    @Autowired
    private Validator validator;

    @PostMapping
    public ResponseEntity<RoomResponseDto> createRoom(
            @RequestPart("room") String roomJson,
            @RequestPart(value = "images", required = false) List<MultipartFile> images) throws IOException {
        RoomRequestCreateDto roomRequest = new ObjectMapper().readValue(roomJson, RoomRequestCreateDto.class);

        Set<ConstraintViolation<RoomRequestCreateDto>> violations = validator.validate(roomRequest);
        if (!violations.isEmpty()) {
            String errorMsg = violations.stream()
                    .map(v -> v.getPropertyPath() + ": " + v.getMessage())
                    .reduce((a, b) -> a + ", " + b)
                    .orElse("Validation error");
            throw new IllegalArgumentException(errorMsg);
        }

        RoomResponseDto roomResponse = roomService.createRoom(images, roomRequest);
        return ResponseEntity.ok(roomResponse);
    }

    @PatchMapping("/{id}")
    public ResponseEntity<RoomResponseDto> updateRoom(
            @PathVariable UUID id,
            @RequestPart("room") String roomJson,
            @RequestPart(value = "images", required = false) List<MultipartFile> images) throws Exception {
        RoomRequestUpdateDto request = new ObjectMapper().readValue(roomJson, RoomRequestUpdateDto.class);

        // Validate input nếu cần
        Set<ConstraintViolation<RoomRequestUpdateDto>> violations = validator.validate(request);
        if (!violations.isEmpty()) {
            String errorMsg = violations.stream()
                    .map(v -> v.getPropertyPath() + ": " + v.getMessage())
                    .reduce((a, b) -> a + ", " + b)
                    .orElse("Validation error");
            throw new IllegalArgumentException(errorMsg);
        }

        RoomResponseDto updatedRoom = roomService.updateRoom(id, images, request);
        return ResponseEntity.ok(updatedRoom);
    }

    @GetMapping("/by-landlord/{id}/paging")
    public ResponseEntity<PaginationRoomResponseDto> getAllRoomByLandlordIdPaginated(@PathVariable("id") UUID id,
            @RequestParam(value = "page", defaultValue = "0") int page,
            @RequestParam(value = "size", defaultValue = "5") int size) {
        PaginationRoomResponseDto rooms = roomService.getAllRoomByLandlordIdPaginated(id, page, size);
        return ResponseEntity.ok(rooms);
    }

    @GetMapping("/by-admin/paging")
    public ResponseEntity<PaginationRoomAdminResponseDto> getAllRoomByAdminPaginated(
            @RequestParam(value = "page", defaultValue = "0") int page,
            @RequestParam(value = "size", defaultValue = "5") int size) {
        PaginationRoomAdminResponseDto rooms = roomService.getAllRoomByAdminPaginated(page, size);
        return ResponseEntity.ok(rooms);
    }

    @PatchMapping("/{id}/hidden")
    public ResponseEntity<RoomShowHideProjectionDto> updateHidden(@PathVariable("id") UUID id,
            @Valid @RequestBody RoomShowHideProjectionDto body) {
        RoomShowHideProjectionDto result = roomService.updateHidden(id, body);
        return ResponseEntity.ok(result);
    }

    @PatchMapping("/{id}/delete")
    public ResponseEntity<RoomDeleteRequestDto> deleteRoom(@PathVariable("id") UUID id,
            @Valid @RequestBody RoomDeleteRequestDto request) {
        RoomDeleteRequestDto result = roomService.deleteRoom(id, request);
        return ResponseEntity.ok(result);
    }

    @PatchMapping("/update-post-extend")
    public ResponseEntity<RoomUpdateExpireDateResponseDto> extendPostDate(
            @RequestBody RoomUpdateExpireDateRequestDto request) {
        RoomUpdateExpireDateResponseDto roomResponse = roomService.updateExpirePostDate(request);
        return ResponseEntity.ok(roomResponse);
    }

    @PatchMapping("/{id}/approval")
    public ResponseEntity<RoomApprovalProjectionDto> updateApproval(@PathVariable("id") UUID id,
            @Valid @RequestBody RoomApprovalProjectionDto body) {
        RoomApprovalProjectionDto result = roomService.updateApproval(id, body);
        return ResponseEntity.ok(result);
    }

    @GetMapping("/{id}")
    public ResponseEntity<RoomResponseDto> getRoomById(@PathVariable("id") UUID id) {
        RoomResponseDto room = roomService.getRoomById(id);
        return ResponseEntity.ok(room);
    }

    @PostMapping("/admin-send-email")
    public ResponseEntity<String> sendEmailToLandlord(
            @RequestPart("data") String dataJson,
            @RequestPart(value = "file", required = false) MultipartFile file) {

        ObjectMapper mapper = new ObjectMapper();
        Map<String, String> data;
        try {
            data = mapper.readValue(dataJson, new com.fasterxml.jackson.core.type.TypeReference<Map<String, String>>() {
            });
        } catch (com.fasterxml.jackson.core.JsonProcessingException e) {
            return ResponseEntity.badRequest().body("Invalid JSON data: " + e.getMessage());
        }

        String email = data.get("email");
        String subject = data.get("subject");
        String message = data.get("message");

        try {
            System.out.println("Controller: Gọi sendAdminMailToLandlord");
            roomService.sendAdminMailToLandlord(email, subject, message, file);
            return ResponseEntity.ok("Email sent successfully");
        } catch (Exception e) {
            e.printStackTrace(); // Log to console
            return ResponseEntity.status(500).body("Failed to send email: " + e.getMessage());
        }
    }

    @GetMapping("allroom-vip")
    public ResponseEntity<PaginationRoomInUserResponseDto> getRoomVipPaginated(
            @RequestParam(name = "page", defaultValue = "0") int pageNumber,
            @RequestParam(name = "size", defaultValue = "5") int pageSize) {
        String code = "VIP";
        PaginationRoomInUserResponseDto response = roomService.getAllRoomInUser(pageNumber, pageSize, code);
        return ResponseEntity.ok(response);
    }

    @GetMapping("allroom-normal")
    public ResponseEntity<PaginationRoomInUserResponseDto> getRoomNormalPaginated(
            @RequestParam(name = "page", defaultValue = "0") int pageNumber,
            @RequestParam(name = "size", defaultValue = "5") int pageSize) {
        String code = "NORMAL";
        PaginationRoomInUserResponseDto response = roomService.getAllRoomInUser(pageNumber, pageSize, code);
        return ResponseEntity.ok(response);
    }

    @PostMapping("filter-rooms")
    public ResponseEntity<PaginationRoomInUserResponseDto> filterRooms(
            @RequestParam(name = "page", defaultValue = "0") int pageNumber,
            @RequestParam(name = "size", defaultValue = "5") int pageSize,
            @RequestBody FilterRoomRequestDto filterDto) {
        PaginationRoomInUserResponseDto response = roomService.filterRooms(pageNumber, pageSize, filterDto);
        return ResponseEntity.ok(response);
    }
}
