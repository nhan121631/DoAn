package com.ants.ktc.ants_ktc.dtos.manage_maintain;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class MaintainStatisticDto {
    private Double cost;
    private String date;
}
