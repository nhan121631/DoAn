package com.ants.ktc.ants_ktc.dtos.booking;

import java.util.UUID;

import lombok.Data;

@Data
public class BookingStatusUpdateRequestDto {
    private int newStatus;
    private UUID actorId;
    private String actorRole; // "Landlord" hoặc "User"
}
