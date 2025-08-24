package com.ants.ktc.ants_ktc.dtos.room;

import java.util.Date;
import java.util.List;
import java.util.UUID;

import com.ants.ktc.ants_ktc.dtos.address.AddressResponseDto;
import com.ants.ktc.ants_ktc.dtos.convenient.ConvenientResponseDto;
import com.ants.ktc.ants_ktc.dtos.image.ImageResponseDto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class RoomResponseDto {
    private UUID id;
    private String title;
    private String description;
    private Double priceMonth;
    private Double priceDeposit;
    private Double area;
    private Double roomLength;
    private Double roomWidth;
    private Double elecPrice;
    private Double waterPrice;
    private Integer maxPeople;
    private int available;
    private int approval;
    private int hidden;
    private int isRemoved;
    private Date postStartDate;
    private Date postEndDate;
    private AddressResponseDto address;
    private List<ImageResponseDto> images;
    private List<ConvenientResponseDto> convenients;
    private String typepost;
    private UUID userId;
    private long favoriteCount;
    private long viewCount;

}
