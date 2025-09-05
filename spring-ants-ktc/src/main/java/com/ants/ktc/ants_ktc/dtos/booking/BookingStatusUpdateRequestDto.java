package com.ants.ktc.ants_ktc.dtos.booking;

import java.util.UUID;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class BookingStatusUpdateRequestDto {
    @Min(value = 0, message = "Status must be a valid number (>=0)")
    @Max(value = 4, message = "Status must not exceed 4")
    private int newStatus;

    @NotNull(message = "Actor ID is required")
    private UUID actorId;

    @NotNull(message = "Actor role is required")
    private String actorRole; // "Landlord" hoặc "User"
}
