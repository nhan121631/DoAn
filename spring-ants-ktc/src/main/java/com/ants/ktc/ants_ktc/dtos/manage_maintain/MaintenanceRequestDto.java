
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
public class MaintenanceRequestDto {
    @NotNull(message = "Room ID must not be null")
    private UUID roomId;

    @NotBlank(message = "Problem description must not be blank")
    private String problem;

    @NotNull(message = "Cost must not be null")
    @PositiveOrZero(message = "Cost must be a non-negative value")
    private Double cost;

}