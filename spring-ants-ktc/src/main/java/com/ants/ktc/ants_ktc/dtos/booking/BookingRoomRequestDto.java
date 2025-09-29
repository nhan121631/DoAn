package com.ants.ktc.ants_ktc.dtos.booking;

import java.util.Date;
import java.util.UUID;

import jakarta.validation.constraints.Future;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BookingRoomRequestDto {
    @NotNull(message = "Room ID is required")
    private UUID roomId;

    @NotNull(message = "Rental date is required")
    // @FutureOrPresent(message = "Rental date must be today or in the future")
    private Date rentalDate;

    @NotNull(message = "Rental expires date is required")
    @Future(message = "Rental expires date must be in the future")
    private Date rentalExpires;

    @Min(value = 1, message = "Tenant count must be at least 1")
    private int tenantCount;
}
