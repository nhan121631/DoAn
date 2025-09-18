package com.ants.ktc.ants_ktc.dtos.bill;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class BillStatisticResponseDto {
    private double revenue;
    private String date;
}
