package com.ants.ktc.ants_ktc.dtos.ads;

import com.ants.ktc.ants_ktc.entities.Ads;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class UpdateAdsDto {

    @NotNull(message = "ID is required")
    private UUID id;

    @NotBlank(message = "Title is required")
    private String title;

    private String description;

    private String linkUrl;

    @NotNull(message = "Position is required")
    private Ads.AdsPosition position;

    @NotNull(message = "Start date is required")
    private String startDate;

    @NotNull(message = "End date is required")
    private String endDate;

    private Boolean isActive;

    private Integer priority;
}
