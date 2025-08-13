package com.ants.ktc.ants_ktc.dtos.room;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Builder
@Data
@NoArgsConstructor
@AllArgsConstructor
public class RoomDeleteRequestDto {

    @Min(value = 0, message = "isRemoved must be 0 or 1")
    @Max(value = 1, message = "isRemoved must be 0 or 1")
    private int isRemoved;
    private String message;
}