package com.ants.ktc.ants_ktc.dtos.bill;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
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
public class BillRequestDto {
    @NotNull(message = "Contract ID must not be null")
    private UUID contractId;

    @NotBlank(message = "Month must not be blank (format YYYY-MM)")
    @Pattern(regexp = "^(20\\d{2})-(0[1-9]|1[0-2])$", message = "Month must follow the format YYYY-MM")
    private String month; // "2025-08"

    @NotNull(message = "Electricity fee must not be null")
    @PositiveOrZero(message = "Electricity fee must be greater than or equal to 0")
    private Double electricityFee;

    @NotNull(message = "Water fee must not be null")
    @PositiveOrZero(message = "Water fee must be greater than or equal to 0")
    private Double waterFee;

    private String note;

    @NotNull(message = "Service fee must not be null")
    @PositiveOrZero(message = "Service fee must be greater than or equal to 0")
    private Double serviceFee;

    @NotNull(message = "Total amount must not be null")
    @PositiveOrZero(message = "Total amount must be greater than or equal to 0")
    private Double totalAmount;


}
