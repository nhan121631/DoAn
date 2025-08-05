package com.ants.ktc.ants_ktc.controllers;

import java.io.IOException;
import java.util.List;
import java.util.Set;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.ants.ktc.ants_ktc.dtos.room.RoomRequestCreateDto;
import com.ants.ktc.ants_ktc.dtos.room.RoomResponseDto;
import com.ants.ktc.ants_ktc.services.RoomService;
import com.fasterxml.jackson.databind.ObjectMapper;

import jakarta.validation.ConstraintViolation;
import jakarta.validation.Validator;

@RestController
@RequestMapping("/api/rooms")
public class RoomController {
    @Autowired
    private RoomService roomService;
    @Autowired
    private Validator validator;

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
}
