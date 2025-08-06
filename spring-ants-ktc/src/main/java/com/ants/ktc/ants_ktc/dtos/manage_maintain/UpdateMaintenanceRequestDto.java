// package com.ants.ktc.ants_ktc.dtos.manage_maintain;

// import jakarta.validation.constraints.NotBlank;
// import jakarta.validation.constraints.NotNull;
// import jakarta.validation.constraints.PositiveOrZero;
// import lombok.Data;

// @Data
// public class UpdateMaintenanceRequestDto {
//     @NotBlank(message = "Problem description cannot be empty")
//     private String problem;

//     @PositiveOrZero(message = "Cost must be a non-negative value")
//     private Double cost;

//     @NotNull(message = "Status is mandatory for update")
//     @PositiveOrZero(message = "Status must be a non-negative integer")
//     private Integer status; // Cập nhật trạng thái (0, 1, 2)
// }

// File: src/main/java/com/ants/ktc/ants_ktc/dtos/manage_maintain/UpdateMaintenanceRequestDto.java
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
    private UUID id; // ID của yêu cầu bảo trì cần cập nhật

    @NotBlank(message = "Problem description must not be blank")
    private String problem;

    @NotNull(message = "Cost must not be null")
    @PositiveOrZero(message = "Cost must be a non-negative value")
    private Double cost;

    @NotNull(message = "Status must not be null")
    private int status; // Trạng thái cập nhật (ví dụ: 0=Pending, 1=In Progress, 2=Completed)
}