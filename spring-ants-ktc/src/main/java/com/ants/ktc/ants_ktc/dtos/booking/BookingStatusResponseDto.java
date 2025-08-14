package com.ants.ktc.ants_ktc.dtos.booking;

import java.util.UUID;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BookingStatusResponseDto {
    private UUID bookingId;
    private int oldStatus;
    private int newStatus;
    private String message;
    private boolean success;
}
