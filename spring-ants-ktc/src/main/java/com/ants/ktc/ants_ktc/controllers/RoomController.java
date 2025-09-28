package com.ants.ktc.ants_ktc.controllers;

import java.io.IOException;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
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
import com.ants.ktc.ants_ktc.dtos.rating.RatingCreateDto;
import com.ants.ktc.ants_ktc.dtos.rating.RatingReplyDto;
import com.ants.ktc.ants_ktc.dtos.rating.RatingResponseDto;
import com.ants.ktc.ants_ktc.dtos.room.PaginationRoomAdminResponseDto;
import com.ants.ktc.ants_ktc.dtos.room.PaginationRoomInUserResponseDto;
import com.ants.ktc.ants_ktc.dtos.room.PaginationRoomResponseDto;
import com.ants.ktc.ants_ktc.dtos.room.RoomApprovalProjectionDto;
import com.ants.ktc.ants_ktc.dtos.room.RoomDeleteRequestDto;
import com.ants.ktc.ants_ktc.dtos.room.RoomInMapResponse;
import com.ants.ktc.ants_ktc.dtos.room.RoomRecentResponseDto;
import com.ants.ktc.ants_ktc.dtos.room.RoomRequestCreateDto;
import com.ants.ktc.ants_ktc.dtos.room.RoomRequestUpdateDto;
import com.ants.ktc.ants_ktc.dtos.room.RoomResponseDto;
import com.ants.ktc.ants_ktc.dtos.room.RoomShowHideProjectionDto;
import com.ants.ktc.ants_ktc.dtos.room.RoomUpdateExpireDateRequestDto;
import com.ants.ktc.ants_ktc.dtos.room.RoomUpdateExpireDateResponseDto;
import com.ants.ktc.ants_ktc.dtos.user.LandlordResponseByRoomDto;
import com.ants.ktc.ants_ktc.enums.FeedbackAccess;
import com.ants.ktc.ants_ktc.services.RatingService;
import com.ants.ktc.ants_ktc.services.RoomService;
import com.ants.ktc.ants_ktc.services.UserService;
import com.fasterxml.jackson.databind.ObjectMapper;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.ConstraintViolation;
import jakarta.validation.Valid;
import jakarta.validation.Validator;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@RestController
@RequestMapping("/api/rooms")
@Tag(name = "Room API", description = "API for managing rooms")
public class RoomController {
    @Autowired
    private RoomService roomService;
    @Autowired
    private Validator validator;
    @Autowired
    private UserService userService;
    @Autowired
    private RatingService ratingService;

    @PostMapping
    @Operation(summary = "Create a new room", description = "Creates a new room")
    @SecurityRequirement(name = "bearerAuth")
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
    @Operation(summary = "Update an existing room", description = "Updates an existing room by ID")
    @SecurityRequirement(name = "bearerAuth")
    public ResponseEntity<RoomResponseDto> updateRoom(
            @PathVariable("id") UUID id,
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
            @RequestParam(value = "size", defaultValue = "5") int size,
            @RequestParam(value = "sortField", required = false) String sortField,
            @RequestParam(value = "sortOrder", required = false) String sortOrder) {
        PaginationRoomAdminResponseDto rooms = roomService.getAllRoomByAdminPaginated(page, size, sortField, sortOrder);
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
            @RequestParam(name = "size", defaultValue = "5") int pageSize,
            @RequestParam(name = "userId", required = false) UUID userId) {
        String code = "VIP";
        PaginationRoomInUserResponseDto response;

        // Nếu có userId, sử dụng sorting theo khoảng cách
        if (userId != null) {
            response = roomService.getAllRoomInUserSortedByDistance(pageNumber, pageSize, code, userId);
        } else {
            // Fallback về method cũ nếu không có userId
            response = roomService.getAllRoomInUser(pageNumber, pageSize, code);
        }

        return ResponseEntity.ok(response);
    }

    @GetMapping("allroom-normal")
    public ResponseEntity<PaginationRoomInUserResponseDto> getRoomNormalPaginated(
            @RequestParam(name = "page", defaultValue = "0") int pageNumber,
            @RequestParam(name = "size", defaultValue = "5") int pageSize,
            @RequestParam(name = "userId", required = false) UUID userId) {
        String code = "NORMAL";
        PaginationRoomInUserResponseDto response;

        // Nếu có userId, sử dụng sorting theo khoảng cách
        if (userId != null) {
            response = roomService.getAllRoomInUserSortedByDistance(pageNumber, pageSize, code, userId);
        } else {
            // Fallback về method cũ nếu không có userId
            response = roomService.getAllRoomInUser(pageNumber, pageSize, code);
        }

        return ResponseEntity.ok(response);
    }

    // API mới - Lấy rooms VIP với tọa độ trực tiếp (cho user chưa đăng nhập)
    @GetMapping("allroom-vip-location")
    public ResponseEntity<PaginationRoomInUserResponseDto> getRoomVipWithLocation(
            @RequestParam(name = "page", defaultValue = "0") int pageNumber,
            @RequestParam(name = "size", defaultValue = "5") int pageSize,
            @RequestParam(name = "lat", required = false) Double latitude,
            @RequestParam(name = "lng", required = false) Double longitude) {
        String code = "VIP";
        PaginationRoomInUserResponseDto response = roomService.getAllRoomInUserWithLocation(
                pageNumber, pageSize, code, latitude, longitude);
        return ResponseEntity.ok(response);
    }

    // API mới - Lấy rooms Normal với tọa độ trực tiếp (cho user chưa đăng nhập)
    @GetMapping("allroom-normal-location")
    public ResponseEntity<PaginationRoomInUserResponseDto> getRoomNormalWithLocation(
            @RequestParam(name = "page", defaultValue = "0") int pageNumber,
            @RequestParam(name = "size", defaultValue = "5") int pageSize,
            @RequestParam(name = "lat", required = false) Double latitude,
            @RequestParam(name = "lng", required = false) Double longitude) {
        String code = "NORMAL";
        PaginationRoomInUserResponseDto response = roomService.getAllRoomInUserWithLocation(
                pageNumber, pageSize, code, latitude, longitude);
        return ResponseEntity.ok(response);
    }

    @PostMapping("filter-rooms")
    public ResponseEntity<PaginationRoomInUserResponseDto> filterRooms(
            @RequestParam(name = "page", defaultValue = "0") int pageNumber,
            @RequestParam(name = "size", defaultValue = "5") int pageSize,
            @Valid @RequestBody FilterRoomRequestDto filterDto) {
        PaginationRoomInUserResponseDto response = roomService.filterRooms(pageNumber, pageSize, filterDto);
        return ResponseEntity.ok(response);
    }

    @GetMapping("recent-rooms")
    public ResponseEntity<List<RoomRecentResponseDto>> getRecentRooms() {
        List<RoomRecentResponseDto> recentRooms = roomService.findRecentRooms();
        return ResponseEntity.ok(recentRooms);
    }

    @GetMapping("landlord-room/{id}")
    public ResponseEntity<LandlordResponseByRoomDto> getLandlordByRoomId(@PathVariable("id") UUID roomId) {
        LandlordResponseByRoomDto landlord = userService.getLandlordInfoByRoomId(roomId);
        return ResponseEntity.ok(landlord);
    }

    @GetMapping("rooms-in-map")
    public ResponseEntity<List<RoomInMapResponse>> getRoomsInMap(
            @RequestParam(value = "lat") double lat,
            @RequestParam(value = "lng") double lng,
            @RequestParam(value = "radius", defaultValue = "15") double radius) {
        List<RoomInMapResponse> rooms = roomService.findRoomInMapWithRadius(lat, lng, radius);
        return ResponseEntity.ok(rooms);
    }

    @GetMapping("/{id}/feedbacks")
    public ResponseEntity<List<RatingResponseDto>> getFeedbacksByRoom(@PathVariable("id") UUID id) {
        List<RatingResponseDto> feedbacks = ratingService.getAllRatingsByRoom(id);
        return ResponseEntity.ok(feedbacks);
    }

    @PostMapping("/{id}/feedbacks")
    public ResponseEntity<RatingResponseDto> createFeedback(
            @PathVariable("id") UUID id,
            @RequestBody RatingCreateDto dto) {
        dto.setRoomId(id);
        RatingResponseDto response = ratingService.createRating(dto);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/feedbacks/{feedbackId}/reply")
    public ResponseEntity<RatingResponseDto> replyFeedback(
            @PathVariable("feedbackId") UUID feedbackId,
            @RequestBody RatingReplyDto dto,
            @RequestParam("landlordId") UUID landlordId) {

        RatingResponseDto response = ratingService.replyRating(landlordId, feedbackId, dto);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{roomId}/feedback-access")
    public ResponseEntity<FeedbackAccess> checkFeedbackAccess(
            @PathVariable("roomId") UUID roomId,
            @RequestParam("userId") UUID userId) {
        FeedbackAccess access = ratingService.checkUserFeedbackAccess(userId, roomId);
        return ResponseEntity.ok(access);
    }

    @GetMapping("/landlords/{landlordId}/feedbacks")
    public ResponseEntity<List<RatingResponseDto>> getFeedbacksByLandlord(
            @PathVariable("landlordId") UUID landlordId) {
        List<RatingResponseDto> feedbacks = ratingService.getAllRatingsByLandlord(landlordId);
        return ResponseEntity.ok(feedbacks);
    }

    @DeleteMapping("/feedbacks/{feedbackId}")
    public ResponseEntity<String> deleteFeedback(
            @PathVariable("feedbackId") UUID feedbackId,
            @RequestParam("userId") UUID userId) {
        String result = ratingService.deleteRating(feedbackId, userId);
        return ResponseEntity.ok(result);
    }

    // tăng lượt xem
    @PostMapping("/{roomId}/view")
    public ResponseEntity<Long> increaseView(@PathVariable("roomId") UUID roomId) {
        long viewCount = roomService.increaseView(roomId);
        return ResponseEntity.ok(viewCount);
    }
}