
// File: src/main/java/com/ants/ktc/ants_ktc/dtos/manage_maintain/MaintenanceResponseDto.java
package com.ants.ktc.ants_ktc.dtos.manage_maintain;

import com.ants.ktc.ants_ktc.dtos.room.RoomResponseDto; // <== Sử dụng RoomResponseDto của bạn của bạn
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Date;
import java.util.UUID;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class MaintenanceResponseDto {
    private UUID id;
    private String problem;
    private Double cost;
    private int status; // Trạng thái bảo trì (ví dụ: 0=Pending, 1=In Progress, 2=Completed)
    private Date requestDate; // Sẽ lấy từ created_date của BaseEntity

    private RoomResponseDto room; // Thông tin phòng liên quan
}