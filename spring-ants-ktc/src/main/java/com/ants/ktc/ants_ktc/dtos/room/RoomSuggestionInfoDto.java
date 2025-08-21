package com.ants.ktc.ants_ktc.dtos.room;

import java.util.UUID;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

// Thông tin phòng gợi ý cho email suggestion
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class RoomSuggestionInfoDto {
    private UUID id;
    private String title;
    private Double priceMonth;
    private Double area;
    private String address;
    private String description;
    private String landlordName;
    private String landlordEmail;
    private String landlordPhone;
    private Double distanceKm; // Khoảng cách tới phòng (km)

}
