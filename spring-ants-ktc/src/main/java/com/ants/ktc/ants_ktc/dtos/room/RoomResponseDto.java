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

    // constructor
    public RoomResponseDto(UUID id, String title, String description, Double priceMonth, Double priceDeposit,
            int available, int approval, int hidden, int isRemoved, Date postStartDate, Date postEndDate,
            AddressResponseDto address,
            List<ConvenientResponseDto> convenients, String typepost, UUID userId) {
        this.id = id;
        this.title = title;
        this.description = description;
        this.priceMonth = priceMonth;
        this.priceDeposit = priceDeposit;
        this.available = available;
        this.approval = approval;
        this.hidden = hidden;
        this.isRemoved = isRemoved;
        this.postStartDate = postStartDate;
        this.postEndDate = postEndDate;
        this.address = address;
        this.convenients = convenients;
        this.typepost = typepost;
        this.userId = userId;
    }

}
