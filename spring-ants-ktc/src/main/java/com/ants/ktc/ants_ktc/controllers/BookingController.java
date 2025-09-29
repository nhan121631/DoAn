package com.ants.ktc.ants_ktc.controllers;

import java.util.List;
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

import com.ants.ktc.ants_ktc.dtos.booking.BookingRoomByUserResponseDto;
import com.ants.ktc.ants_ktc.dtos.booking.BookingRoomRequestDto;
import com.ants.ktc.ants_ktc.dtos.booking.BookingStatusResponseDto;
import com.ants.ktc.ants_ktc.dtos.booking.BookingStatusUpdateRequestDto;
import com.ants.ktc.ants_ktc.dtos.booking.LandlordPaymentInfoDto;
import com.ants.ktc.ants_ktc.dtos.booking.PaginationLandlordResponseDto;
import com.ants.ktc.ants_ktc.dtos.booking.PaginationUserBookingRoomResponseDto;
import com.ants.ktc.ants_ktc.services.BookingService;

import io.swagger.v3.oas.annotations.tags.Tag;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/bookings")
@Tag(name = "Booking API", description = "API for managing bookings")
@SecurityRequirement(name = "bearerAuth")
public class BookingController {

    @Autowired
    private BookingService bookingService;

    // createbooking
    @PostMapping("/user/{userId}")
    @Operation(summary = "Create a new booking", description = "Creates a new booking for a user")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Booking created successfully", content = @Content(mediaType = "application/json", schema = @Schema(implementation = BookingRoomByUserResponseDto.class))),
            @ApiResponse(responseCode = "401", description = "Unauthorized - invalid or missing JWT token", content = @Content(mediaType = "application/json", schema = @Schema(example = """
                    {
                        "status": 401,
                        "messages": [
                            "JWT token is missing or invalid"
                            ],
                            "error": "Unauthorized"
                        }
                        """))),
            @ApiResponse(responseCode = "403", description = "Access denied - insufficient privileges", content = @Content(mediaType = "application/json", schema = @Schema(example = """
                    {
                        "status": 403,
                        "messages": [
                            "Access denied. Required role: Administrator or Manager"
                        ],
                        "error": "Forbidden"
                    }
                    """)))
    })
    public ResponseEntity<?> createBooking(
            @PathVariable("userId") UUID userId,
            @Valid @RequestBody BookingRoomRequestDto request) {
        try {
            BookingRoomByUserResponseDto response = bookingService.createBooking(userId, request);
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // get all booking by user
    @GetMapping("/{userId}")
    @Operation(summary = "Get all bookings by user", description = "Retrieves all bookings for a specific user")
    public ResponseEntity<List<BookingRoomByUserResponseDto>> getUserBookings(@PathVariable("userId") UUID userId) {
        List<BookingRoomByUserResponseDto> bookings = bookingService.getUserBookings(userId);
        return ResponseEntity.ok(bookings);
    }

    @GetMapping("/user/{userId}/paging")
    @Operation(summary = "Get paginated bookings by user", description = "Retrieves paginated bookings for a specific user")
    public ResponseEntity<PaginationUserBookingRoomResponseDto> getPaginatedUserBookings(
            @PathVariable("userId") UUID userId,
            @RequestParam("page") int page,
            @RequestParam("size") int size) {
        PaginationUserBookingRoomResponseDto response = bookingService.getPaginatedUserBookings(userId, page, size);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/landlord/{landlordId}/paging")
    @Operation(summary = "Get paginated bookings by landlord", description = "Retrieves paginated bookings for a specific landlord")
    public ResponseEntity<PaginationLandlordResponseDto> getPaginatedLandlordBookings(
            @PathVariable("landlordId") UUID landlordId,
            @RequestParam("page") int page,
            @RequestParam("size") int size) {
        PaginationLandlordResponseDto response = bookingService.getPaginatedLandlordBookings(landlordId, page, size);
        return ResponseEntity.ok(response);
    }

    // landlord get all bookings
    // @GetMapping("/room/{roomId}")
    // public ResponseEntity<List<BookingRoomResponseDto>>
    // getRoomBookings(@PathVariable UUID roomId) {
    // List<BookingRoomResponseDto> bookings =
    // bookingService.getRoomBookings(roomId);
    // return ResponseEntity.ok(bookings);
    // }

    // Cập nhật trạng thái booking
    @PatchMapping("/{bookingId}/status")
    @Operation(summary = "Update booking status", description = "Updates the status of a specific booking")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Booking status updated successfully", content = @Content(mediaType = "application/json", schema = @Schema(implementation = BookingStatusResponseDto.class))),
            @ApiResponse(responseCode = "400", description = "Bad Request - invalid input data", content = @Content(mediaType = "application/json", schema = @Schema(example = """
                    {
                        "status": 400,
                        "messages": [
                            "Invalid booking status transition"
                        ],
                        "error": "Bad Request"
                    }
                    """))),
            @ApiResponse(responseCode = "401", description = "Unauthorized - invalid or missing JWT token", content = @Content(mediaType = "application/json", schema = @Schema(example = """
                    {
                        "status": 401,
                        "messages": [
                            "JWT token is missing or invalid"
                            ],
                            "error": "Unauthorized"
                        }
                        """))),
            @ApiResponse(responseCode = "403", description = "Access denied - insufficient privileges", content = @Content(mediaType = "application/json", schema = @Schema(example = """
                    {
                        "status": 403,
                        "messages": [
                            "Access denied. Required role: Administrator or Manager"
                        ],
                        "error": "Forbidden"
                    }
                    """)))
    })
    public ResponseEntity<?> updateBookingStatus(
            @PathVariable("bookingId") UUID bookingId,
            @Valid @RequestBody BookingStatusUpdateRequestDto request) {
        try {
            BookingStatusResponseDto response = bookingService.updateBookingStatus(
                    bookingId,
                    request.getNewStatus(),
                    request.getActorId(),
                    request.getActorRole());
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping("/{bookingId}/landlord-payment-info")
    @Operation(summary = "Get landlord payment info for a booking", description = "Retrieves payment information for the landlord associated with a specific booking")
    public ResponseEntity<?> getLandlordPaymentInfo(@PathVariable("bookingId") UUID bookingId) {
        try {
            LandlordPaymentInfoDto paymentInfo = bookingService.getLandlordPaymentInfo(bookingId);
            return ResponseEntity.ok(paymentInfo);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PatchMapping("/{bookingId}/delete")
    @Operation(summary = "Delete a booking", description = "Deletes a specific booking by ID")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Booking deleted successfully", content = @Content(mediaType = "application/json", schema = @Schema(example = """
                    {
                        "message": "Booking deleted successfully"
                    }
                    """))),
            @ApiResponse(responseCode = "400", description = "Bad Request - invalid input data", content = @Content(mediaType = "application/json", schema = @Schema(example = """
                    {
                        "status": 400,
                        "messages": [
                            "Cannot delete booking that is already completed or cancelled"
                        ],
                        "error": "Bad Request"
                    }
                    """))),
            @ApiResponse(responseCode = "401", description = "Unauthorized - invalid or missing JWT token", content = @Content(mediaType = "application/json", schema = @Schema(example = """
                    {
                        "status": 401,
                        "messages": [
                            "JWT token is missing or invalid"
                            ],
                            "error": "Unauthorized"
                        }
                        """))),
            @ApiResponse(responseCode = "403", description = "Access denied - insufficient privileges", content = @Content(mediaType = "application/json", schema = @Schema(example = """
                    {
                        "status": 403,
                        "messages": [
                            "Access denied. Required role: Administrator or Manager"
                        ],
                        "error": "Forbidden"
                    }
                    """)))
    })
    public ResponseEntity<?> deleteBooking(@PathVariable("bookingId") UUID bookingId,
            @RequestParam("userId") UUID userId) {
        try {
            bookingService.deleteBooking(bookingId, userId);
            return ResponseEntity.ok("Booking deleted successfully");
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // Upload bill transfer image
    @PostMapping("/{bookingId}/upload-bill-transfer")
    @Operation(summary = "Upload bill transfer image", description = "Upload a bill transfer image for a booking")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Image uploaded successfully", content = @Content(mediaType = "application/json", schema = @Schema(example = """
                    {
                        "message": "Image uploaded successfully",
                        "imageUrl": "/v1234567890/folder/image.jpg"
                    }
                    """))),
            @ApiResponse(responseCode = "400", description = "Bad request - invalid booking ID or file", content = @Content(mediaType = "application/json", schema = @Schema(example = """
                    {
                        "error": "Booking not found"
                    }
                    """))),
            @ApiResponse(responseCode = "401", description = "Unauthorized - invalid or missing JWT token"),
            @ApiResponse(responseCode = "500", description = "Internal server error - upload failed")
    })
    public ResponseEntity<?> uploadBillTransferImage(
            @PathVariable("bookingId") UUID bookingId,
            @RequestPart("file") MultipartFile file) {
        try {
            String imageUrl = bookingService.uploadBillTransferImage(bookingId, file);
            return ResponseEntity.ok(java.util.Map.of(
                    "message", "Image uploaded successfully",
                    "imageUrl", imageUrl));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(java.util.Map.of("error", e.getMessage()));
        } catch (RuntimeException e) {
            return ResponseEntity.status(500).body(java.util.Map.of("error", e.getMessage()));
        }
    }

}
