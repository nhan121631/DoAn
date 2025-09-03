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
public class ContractRequestDto {
    @NotNull(message = "Room ID must not be null")
    private UUID roomId;

    @NotNull(message = "Tenant ID must not be null")
    private UUID tenantId;

    @NotNull(message = "Landlord ID must not be null")
    private UUID landlordId;

    @NotNull(message = "Start date must not be null")
    @FutureOrPresent(message = "Start date must be today or in the future")
    private Date startDate;

    @NotNull(message = "End date must not be null")
    @Future(message = "End date must be in the future")
    private Date endDate;

    @NotNull(message = "Deposit amount must not be null")
    @PositiveOrZero(message = "Deposit amount must be greater than or equal to 0")
    private Double depositAmount;

    @NotNull(message = "Monthly rent must not be null")
    @Positive(message = "Monthly rent must be greater than 0")
    private Double monthlyRent;

    @Min(value = 0, message = "Status value is not valid")
    @Max(value = 3, message = "Status value is not valid")
    private int status; // 0: active, 1: terminated, 2: expired, 3: pending
}