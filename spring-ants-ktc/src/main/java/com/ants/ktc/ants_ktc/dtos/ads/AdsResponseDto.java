package com.ants.ktc.ants_ktc.dtos.ads;

import com.ants.ktc.ants_ktc.entities.Ads;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Date;
import java.util.UUID;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class AdsResponseDto {

    private UUID id;
    private String title;
    private String description;
    private String imageUrl;
    private String linkUrl;
    private Ads.AdsPosition position;
    private Date startDate;
    private Date endDate;
    private Boolean isActive;
    private Integer priority;
    private Date createdDate;
    private Date modifiedDate;
    private String createBy;
    private String modifiedBy;
    private Boolean isCurrentlyActive;

    public static AdsResponseDto fromEntity(Ads ads) {
        AdsResponseDto dto = new AdsResponseDto();
        dto.setId(ads.getId());
        dto.setTitle(ads.getTitle());
        dto.setDescription(ads.getDescription());
        dto.setImageUrl(ads.getImageUrl());
        dto.setLinkUrl(ads.getLinkUrl());
        dto.setPosition(ads.getPosition());
        dto.setStartDate(ads.getStartDate());
        dto.setEndDate(ads.getEndDate());
        dto.setIsActive(ads.getIsActive());
        dto.setPriority(ads.getPriority());
        dto.setCreatedDate(ads.getCreatedDate());
        dto.setModifiedDate(ads.getModifiedDate());
        dto.setCreateBy(ads.getCreateBy());
        dto.setModifiedBy(ads.getModifiedBy());
        dto.setIsCurrentlyActive(ads.isCurrentlyActive());
        return dto;
    }
}
