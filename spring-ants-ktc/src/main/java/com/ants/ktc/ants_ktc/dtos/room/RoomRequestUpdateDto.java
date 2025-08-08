package com.ants.ktc.ants_ktc.dtos.room;

import java.util.List;
import java.util.UUID;

import com.ants.ktc.ants_ktc.dtos.address.AddressCreateRequestDto;
import com.ants.ktc.ants_ktc.dtos.image.ImageCreateRequestDto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class RoomRequestUpdateDto {
    private String title;
    private String description;
    private Double priceMonth;
    private Double priceDeposit;
    private Double area;
    private AddressCreateRequestDto address;
    private UUID userId;
    private List<Long> convenientIds;
    private List<ImageCreateRequestDto> imageUrls;
}
