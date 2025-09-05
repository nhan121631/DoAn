package com.ants.ktc.ants_ktc.dtos.room;

import java.util.Date;
import java.util.UUID;

import jakarta.validation.constraints.Future;
import jakarta.validation.constraints.FutureOrPresent;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Builder
@Data
@NoArgsConstructor
@AllArgsConstructor
public class RoomUpdateExpireDateRequestDto {
    @NotNull(message = "Room ID is required.")
    UUID roomId;

    @NotNull(message = "Post start date is required.")
    @FutureOrPresent(message = "Post start date must be today or in the future.")
    Date postStartDate;
    
    @NotNull(message = "Post end date is required.")
    @Future(message = "Post end date must be in the future.")
    Date postEndDate;
    private UUID typepostId;

}
