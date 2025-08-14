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
import org.springframework.web.bind.annotation.RestController;

import com.ants.ktc.ants_ktc.dtos.booking.BookingRoomByUserResponseDto;
import com.ants.ktc.ants_ktc.dtos.booking.BookingRoomRequestDto;
import com.ants.ktc.ants_ktc.dtos.booking.BookingStatusResponseDto;
import com.ants.ktc.ants_ktc.dtos.booking.BookingStatusUpdateRequestDto;
import com.ants.ktc.ants_ktc.dtos.booking.LandlordPaymentInfoDto;
import com.ants.ktc.ants_ktc.dtos.booking.PaginationLandlordResponseDto;
import com.ants.ktc.ants_ktc.dtos.booking.PaginationUserBookingRoomResponseDto;
import com.ants.ktc.ants_ktc.services.BookingService;

@RestController
@RequestMapping("/api/bookings")
public class BookingController {

    @Autowired
    private BookingService bookingService;

    // createbooking
    @PostMapping("/user/{userId}")
    public ResponseEntity<?> createBooking(
            @PathVariable("userId") UUID userId,
            @RequestBody BookingRoomRequestDto request) {
        try {
            BookingRoomByUserResponseDto response = bookingService.createBooking(userId, request);
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // get all booking by user
    @GetMapping("/{userId}")
    public ResponseEntity<List<BookingRoomByUserResponseDto>> getUserBookings(@PathVariable("userId") UUID userId) {
        List<BookingRoomByUserResponseDto> bookings = bookingService.getUserBookings(userId);
        return ResponseEntity.ok(bookings);
    }

    @GetMapping("/user/{userId}/paging")
    public ResponseEntity<PaginationUserBookingRoomResponseDto> getPaginatedUserBookings(
            @PathVariable("userId") UUID userId,
            @RequestParam int page,
            @RequestParam int size) {
        PaginationUserBookingRoomResponseDto response = bookingService.getPaginatedUserBookings(userId, page, size);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/landlord/{landlordId}/paging")
    public ResponseEntity<PaginationLandlordResponseDto> getPaginatedLandlordBookings(
            @PathVariable("landlordId") UUID landlordId,
            @RequestParam int page,
            @RequestParam int size) {
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
    public ResponseEntity<?> updateBookingStatus(
            @PathVariable("bookingId") UUID bookingId,
            @RequestBody BookingStatusUpdateRequestDto request) {
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
    public ResponseEntity<?> getLandlordPaymentInfo(@PathVariable("bookingId") UUID bookingId) {
        try {
            LandlordPaymentInfoDto paymentInfo = bookingService.getLandlordPaymentInfo(bookingId);
            return ResponseEntity.ok(paymentInfo);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PatchMapping("/{bookingId}/delete")
    public ResponseEntity<?> deleteBooking(@PathVariable("bookingId") UUID bookingId,
            @RequestParam("userId") UUID userId) {
        try {
            bookingService.deleteBooking(bookingId, userId);
            return ResponseEntity.ok("Booking deleted successfully");
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

}
