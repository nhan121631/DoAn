package com.ants.ktc.ants_ktc.dtos.bill;

import com.ants.ktc.ants_ktc.enums.BillStatus;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.PositiveOrZero;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BillUpdateDto {
    private UUID id;

    @Pattern(regexp = "^(20\\d{2})-(0[1-9]|1[0-2])$", message = "Month must follow the format YYYY-MM")
    private String month; // optional

    @PositiveOrZero(message = "Electricity fee must be >= 0")
    private Double electricityFee;

    @PositiveOrZero(message = "Water fee must be >= 0")
    private Double waterFee;

    @PositiveOrZero(message = "Service fee must be >= 0")
    private Double serviceFee;

    private String note;

    @PositiveOrZero(message = "Total amount must be >= 0")
    private Double totalAmount;
    
    private BillStatus status;
}