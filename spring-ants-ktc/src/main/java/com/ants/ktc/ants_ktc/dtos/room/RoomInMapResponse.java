package com.ants.ktc.ants_ktc.dtos.room;

import java.util.UUID;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class RoomInMapResponse {
    private UUID id;
    private String title;
    private String imageUrl;
    private Double area;
    private Double priceMonth;
    private String postType;
    private String fullAddress;
    private Double lng;
    private Double lat;
}
