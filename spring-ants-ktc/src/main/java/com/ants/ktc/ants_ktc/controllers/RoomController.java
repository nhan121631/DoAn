package com.ants.ktc.ants_ktc.controllers;

import java.io.IOException;
import java.util.List;
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

import com.ants.ktc.ants_ktc.dtos.room.PaginationRoomResponseDto;
import com.ants.ktc.ants_ktc.dtos.room.RoomRequestCreateDto;
import com.ants.ktc.ants_ktc.dtos.room.RoomResponseDto;
import com.ants.ktc.ants_ktc.dtos.room.RoomResponseProjectionDto;
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

    @GetMapping
    public ResponseEntity<List<RoomResponseDto>> getAllRooms() {
        List<RoomResponseDto> rooms = roomService.getAllRooms();
        return ResponseEntity.ok(rooms);
    }

    // @GetMapping("/{roomId}")
    // public ResponseEntity<RoomResponseDto> getRoom(@PathVariable UUID roomId) {
    // RoomResponseDto dto = roomService.getRoom(roomId);
    // return ResponseEntity.ok(dto);
    // }

    // @PostMapping("/create/by-user/{userId}")
    // public ResponseEntity<RoomResponseDto> createRoomByUserId(
    // @PathVariable UUID userId,
    // @RequestPart("room") String roomJson,
    // @RequestPart(value = "images", required = false) List<MultipartFile> images)
    // throws IOException {
    // return null;

    // }

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

    // @GetMapping("/by-landlord/{id}")
    // public ResponseEntity<List<RoomResponseDto>>
    // getAllRoomByLandlordId(@PathVariable("id") UUID id) {
    // List<RoomResponseDto> rooms = roomService.getAllRoomByLandlordId(id);
    // return ResponseEntity.ok(rooms);
    // }

    @GetMapping("/by-landlord/{id}/paging")
    public ResponseEntity<PaginationRoomResponseDto> getAllRoomByLandlordIdPaginated(@PathVariable("id") UUID id,
            @RequestParam(value = "page", defaultValue = "0") int page,
            @RequestParam(value = "size", defaultValue = "5") int size) {
        PaginationRoomResponseDto rooms = roomService.getAllRoomByLandlordIdPaginated(id, page, size);
        return ResponseEntity.ok(rooms);
    }

    @PatchMapping("/{id}/hidden")
    public ResponseEntity<RoomShowHideProjectionDto> updateHidden(@PathVariable UUID id,
            @Valid @RequestBody RoomShowHideProjectionDto body) {
        RoomShowHideProjectionDto result = roomService.updateHidden(id, body);
        return ResponseEntity.ok(result);
    }

    @PatchMapping("/update-post-extend")
    public ResponseEntity<RoomUpdateExpireDateResponseDto> extendPostDate(
            @RequestBody RoomUpdateExpireDateRequestDto request) {
        RoomUpdateExpireDateResponseDto roomResponse = roomService.updateExpirePostDate(request);
        return ResponseEntity.ok(roomResponse);
    }
    @GetMapping("/{id}")
    public ResponseEntity<RoomResponseDto> getRoomById(@PathVariable("id") UUID id) {
        RoomResponseDto room = roomService.getRoomById(id);
        return ResponseEntity.ok(room);
    }

}
