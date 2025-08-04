package com.ants.ktc.ants_ktc.dtos.manage_maintain;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;
import lombok.Data;
import java.util.UUID;

@Data
public class MaintenanceRequestDto {
    @NotNull(message = "Room ID is mandatory")
    private UUID roomId;

    @NotBlank(message = "Problem description is mandatory")
    private String problem;

    private Double cost;

    @NotNull(message = "Status is mandatory")
    @PositiveOrZero(message = "Status must be a non-negative integer")
    private Integer status; // 0: pending, 1: in_progress, 2: completed
}