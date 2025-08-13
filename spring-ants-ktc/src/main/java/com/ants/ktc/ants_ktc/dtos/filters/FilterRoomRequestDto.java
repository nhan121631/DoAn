package com.ants.ktc.ants_ktc.dtos.filters;

import java.util.List;

import jakarta.validation.constraints.Min;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FilterRoomRequestDto {

    @Min(value = 0, message = "min price must be >= 0")
    private Double minPrice;

    @Min(value = 0, message = "max price must be >= 0")
    private Double maxPrice;

    @Min(value = 0, message = "min area must be >= 0")
    private Double minArea;

    @Min(value = 0, message = "max area must be >= 0")
    private Double maxArea;

    private Long provinceId;

    private Long districtId;

    private Long wardId;

    private List<Long> listConvenientIds;
    private Long sizeOfList;

}
