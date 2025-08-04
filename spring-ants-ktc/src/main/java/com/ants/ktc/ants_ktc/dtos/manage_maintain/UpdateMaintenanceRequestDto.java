package com.ants.ktc.ants_ktc.dtos.manage_maintain;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;
import lombok.Data;

@Data
public class UpdateMaintenanceRequestDto {
    @NotBlank(message = "Problem description cannot be empty")
    private String problem;

    @PositiveOrZero(message = "Cost must be a non-negative value")
    private Double cost;

    @NotNull(message = "Status is mandatory for update")
    @PositiveOrZero(message = "Status must be a non-negative integer")
    private Integer status; // Cập nhật trạng thái (0, 1, 2)
}