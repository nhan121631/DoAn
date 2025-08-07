package com.ants.ktc.ants_ktc.dtos.manage_maintain;

import lombok.Data;
import java.util.UUID;

@Data
public class RoomResponseDto {

    private UUID id;
    private String name;
    // private String roomCode;
    // private Double area;
    // private Integer numberOfBeds;
    private String roomAddress;
}