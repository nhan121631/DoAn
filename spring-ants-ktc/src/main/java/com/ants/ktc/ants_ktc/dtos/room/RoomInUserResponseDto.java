package com.ants.ktc.ants_ktc.dtos.room;

import java.util.Date;
import java.util.List;
import java.util.UUID;

import com.ants.ktc.ants_ktc.dtos.address.AddressResponseDto;
import com.ants.ktc.ants_ktc.dtos.convenient.ConvenientResponseDto;
import com.ants.ktc.ants_ktc.dtos.image.ImageResponseDto;
import com.ants.ktc.ants_ktc.dtos.user.LandlordResponseDto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class RoomInUserResponseDto {
    private UUID id;
    private String title;
    private String description;
    private Double priceMonth;
    private Double area;
    private Integer maxPeople;
    private Date postStartDate;
    private AddressResponseDto address;
    private List<ImageResponseDto> images;
    private List<ConvenientResponseDto> conveniences;
    private LandlordResponseDto landlord;
    private long favoriteCount;
    private long viewCount;
}
