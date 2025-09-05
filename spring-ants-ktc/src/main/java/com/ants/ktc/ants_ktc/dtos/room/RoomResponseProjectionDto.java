package com.ants.ktc.ants_ktc.dtos.room;

import java.util.Date;
import java.util.UUID;

import com.ants.ktc.ants_ktc.dtos.address.AddressResponseDto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class RoomResponseProjectionDto {
    UUID id;
    String title;
    String description;
    Double priceMonth;
    Double priceDeposit;
    Double area;
    Double elecPrice;
    Double waterPrice;
    Double roomLength;
    Double roomWidth;
    Integer maxPeople;
    int available;
    int approval;
    int hidden;
    int isRemoved;
    Date postStartDate;
    Date postEndDate;
    AddressResponseDto address;
    // List<ConvenientResponseDto> convenients;
    String typepost;
}
