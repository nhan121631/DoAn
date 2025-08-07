package com.ants.ktc.ants_ktc.dtos.room;

import java.util.UUID;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Builder
@Data
@NoArgsConstructor
@AllArgsConstructor
public class RoomShowHideProjectionDto {
    private UUID id;
    private int isHidden;
}
