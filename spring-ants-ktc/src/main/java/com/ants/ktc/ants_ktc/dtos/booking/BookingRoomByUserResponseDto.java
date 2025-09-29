package com.ants.ktc.ants_ktc.dtos.booking;

import java.util.Date;
import java.util.UUID;

import com.ants.ktc.ants_ktc.dtos.room.RoomBookingByUserResponseDto;
// import com.ants.ktc.ants_ktc.dtos.user.UserBookingResponseDto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BookingRoomByUserResponseDto {
    private UUID bookingId;
    private Date rentalDate;
    private Date rentalExpires;
    private int tenantCount;
    private int status; // 0: pending, 1: accepted, 2: rejected, 3: waiting for deposit, 4: deposited
    private int isRemoved; // 0: not removed, 1: removed
    private String imageProof; // URL of bill transfer image
    private RoomBookingByUserResponseDto room;
    // private UserBookingResponseDto user;
}
