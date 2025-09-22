package com.ants.ktc.ants_ktc.dtos.ads;

import com.ants.ktc.ants_ktc.entities.Ads;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class CreateAdsDto {

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

    private Boolean isActive = true;

    private Integer priority = 0;
}
