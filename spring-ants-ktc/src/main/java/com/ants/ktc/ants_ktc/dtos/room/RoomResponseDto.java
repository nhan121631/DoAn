package com.ants.ktc.ants_ktc.dtos.room;
import java.util.Date;
import java.util.List;
import java.util.UUID;

import com.ants.ktc.ants_ktc.dtos.convenient.ConvenientResponseDto;
import com.ants.ktc.ants_ktc.dtos.image.ImageResponseDto;
import com.ants.ktc.ants_ktc.dtos.post_types.PostTypeResponseDto;

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
    private Date postStartDate;
    private Date postEndDate;
    List<ImageResponseDto> images;
    List<ConvenientResponseDto> convenients;
    private PostTypeResponseDto postType;
}
