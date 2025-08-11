package com.ants.ktc.ants_ktc.dtos.room;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Builder
@Data
@NoArgsConstructor
@AllArgsConstructor
public class RoomApprovalProjectionDto {
    private int approval;
    private String message;
}
