
package com.ants.ktc.ants_ktc.dtos.manage_maintain;

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
    private int status; // (0=Pending, 1=In Progress, 2=Completed)
    private Date requestDate; //

    private RoomDetailForMaintenanceDto room;
}