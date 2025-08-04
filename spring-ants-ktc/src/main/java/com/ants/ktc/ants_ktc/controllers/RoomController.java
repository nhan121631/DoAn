package com.ants.ktc.ants_ktc.controllers;

import java.io.IOException;
import java.util.List;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.ants.ktc.ants_ktc.dtos.room.RoomRequestDto;
import com.ants.ktc.ants_ktc.dtos.room.RoomResponseDto;
import com.ants.ktc.ants_ktc.entities.Room;
import com.ants.ktc.ants_ktc.services.RoomService;
import com.fasterxml.jackson.databind.ObjectMapper;

@RestController
@RequestMapping("/api/rooms")
public class RoomController {
    @Autowired
    private RoomService roomService;

    @GetMapping("/{roomId}")
    public ResponseEntity<RoomResponseDto> getRoom(@PathVariable UUID roomId) {
        RoomResponseDto dto = roomService.getRoom(roomId);
        return ResponseEntity.ok(dto);
    }

    @PostMapping("/create/by-user/{userId}")
    public ResponseEntity<RoomResponseDto> createRoomByUserId(
            @PathVariable UUID userId,
            @RequestPart("room") String roomJson,
            @RequestPart(value = "images", required = false) List<MultipartFile> images) throws IOException {
        ObjectMapper objectMapper = new ObjectMapper();
        RoomRequestDto requestDto = objectMapper.readValue(roomJson, RoomRequestDto.class);
        requestDto.setImages(images);
        RoomResponseDto dto = roomService.createRoomByUserId(userId, requestDto);
        return ResponseEntity.ok(dto);
    }
}
