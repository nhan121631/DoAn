package com.ants.ktc.ants_ktc.dtos.room;

import java.util.UUID;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;

@Builder
@Data
@NoArgsConstructor
@AllArgsConstructor
public class RoomShowHideProjectionDto {
    private UUID id;

    @Min(value = 0, message = "isHidden must be 0 or 1")
    @Max(value = 1, message = "isHidden must be 0 or 1")
    private int isHidden;
    private String message;
}
