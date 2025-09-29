package com.ants.ktc.ants_ktc.dtos.contract;

import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Date;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ContractUpdateRequestDto {

    private UUID id;

    private UUID roomId;

    private UUID tenantId;

    private UUID landlordId;


    private Date startDate;

    @Future(message = "End date must be in the future")
    private Date endDate;

    @PositiveOrZero(message = "Deposit amount must be greater than or equal to 0")
    private Double depositAmount;

    @Positive(message = "Monthly rent must be greater than 0")
    private Double monthlyRent;

    @Min(value = 0, message = "Status value is not valid")
    @Max(value = 3, message = "Status value is not valid")
    private Integer status; // cho phép null -> giữ nguyên nếu không update
    private String contractImage;
}
