package com.ants.ktc.ants_ktc.dtos.manage_maintain;

import lombok.Data;
import java.util.Date;
import java.util.UUID;

@Data
public class MaintenanceResponseDto {
    private UUID id;
    private String problem;
    private Double cost;
    private String status;
    private Date createdDate;
    private Date modifiedDate;

    private UUID roomId;
    private String roomTitle;
    private String roomAddress;
}