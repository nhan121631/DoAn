package com.ants.ktc.ants_ktc.dtos.room;

import java.util.Date;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Builder
@Data
@NoArgsConstructor
@AllArgsConstructor
public class RoomUpdateExpireDateResponseDto {
    
    Date postStartDate;
    Date postEndDate;
    String message;
}
