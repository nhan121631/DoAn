package com.ants.ktc.ants_ktc.dtos.bill;


import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BillResponseDto {
    private UUID id;
    private String month;
    private Double electricityFee;
    private Double waterFee;
    private Double serviceFee;
    private Double totalAmount;
    private boolean paid;
}
