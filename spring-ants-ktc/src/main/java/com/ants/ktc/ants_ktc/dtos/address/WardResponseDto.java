package com.ants.ktc.ants_ktc.dtos.address;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class WardResponseDto {
    private Long id;
    private String name;
    // private DistrictResponseDto district;

}
