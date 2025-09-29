package com.ants.ktc.ants_ktc.dtos.room;

import java.util.UUID;

import com.ants.ktc.ants_ktc.dtos.address.AddressResponseDto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RoomBookingByUserResponseDto {
    private UUID roomId;
    private String title;
    // private String description;
    private Double priceMonth;
    private Double priceDeposit;
    private int available;
    private Double area;
    private String ownerName;
    private String ownerPhone;
    private String imageProof;
    private AddressResponseDto address;
}
