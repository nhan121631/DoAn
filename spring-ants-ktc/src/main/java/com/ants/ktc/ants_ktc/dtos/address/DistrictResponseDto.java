package com.ants.ktc.ants_ktc.dtos.address;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class DistrictResponseDto {
    private Long id;
    private String name;
    private ProvinceResponseDto province;
    // private ProvinceResponseDto province;
    // private List<WardResponseDto> wards;

}
