package com.ants.ktc.ants_ktc.dtos.room;

import java.util.Date;
import java.util.UUID;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Builder
@Data
@NoArgsConstructor
@AllArgsConstructor
public class RoomUpdateExpireDateRequestDto {
    UUID roomId;
    Date postStartDate;
    Date postEndDate;
    private UUID typepostId;

}
