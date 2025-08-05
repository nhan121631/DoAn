// package com.ants.ktc.ants_ktc.dtos.manage_maintain;

// import jakarta.validation.constraints.NotBlank;
// import jakarta.validation.constraints.NotNull;
// import jakarta.validation.constraints.PositiveOrZero;
// import lombok.Data;
// import java.util.UUID;

// @Data
// public class MaintenanceRequestDto {
//     @NotNull(message = "Room ID is mandatory")
//     private UUID roomId;

//     @NotBlank(message = "Problem description is mandatory")
//     private String problem;

//     private Double cost;

//     @NotNull(message = "Status is mandatory")
//     @PositiveOrZero(message = "Status must be a non-negative integer")
//     private Integer status; // 0: pending, 1: in_progress, 2: completed
// }

// File: src/main/java/com/ants/ktc/ants_ktc/dtos/manage_maintain/MaintenanceRequestDto.java
package com.ants.ktc.ants_ktc.dtos.manage_maintain;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero; // Để kiểm soát giá trị không âm

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

    // Status sẽ được đặt mặc định ở Backend hoặc được quy định rõ ràng.
    // Nếu bạn muốn Landlord có thể đặt trạng thái ban đầu (vd: "Đã yêu cầu"), bạn
    // có thể thêm:
    // private int status; // Cần định nghĩa rõ các giá trị int tương ứng với trạng
    // thái
}