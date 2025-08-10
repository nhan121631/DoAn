
package com.ants.ktc.ants_ktc.dtos.manage_maintain;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class UpdateMaintenanceRequestDto {
    @NotNull(message = "Maintenance ID must not be null")
    private UUID id;

    @NotBlank(message = "Problem description must not be blank")
    private String problem;

    @NotNull(message = "Cost must not be null")
    @PositiveOrZero(message = "Cost must be a non-negative value")
    private Double cost;

    @NotNull(message = "Status must not be null")
    private int status; // 0=Pending, 1=In Progress, 2=Completed
}