package com.ants.ktc.ants_ktc.dtos.manage_maintain;

import java.util.UUID;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class RoomDetailForMaintenanceDto {
    private UUID id;
    private String title;
}
