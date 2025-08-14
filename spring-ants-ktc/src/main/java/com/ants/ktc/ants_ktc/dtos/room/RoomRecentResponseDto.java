package com.ants.ktc.ants_ktc.dtos.room;

import java.util.Date;
import java.util.UUID;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class RoomRecentResponseDto {
    private UUID id;
    private String title;
    private Double priceMonth;
    private Date postStartDate;
    private String imageUrl;
}
