package com.ants.ktc.ants_ktc.dtos.bill;

import com.ants.ktc.ants_ktc.enums.BillStatus;
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

    // Điện
    private Double electricityPrice;
    private Double electricityUsage;
    private Double electricityFee;

    // Nước
    private Double waterPrice;
    private Double waterUsage;
    private Double waterFee;

    private Double damageFee;
    private String note;
    private Double serviceFee;
    private Double totalAmount;
    private BillStatus status;
    private String imageProof;
}