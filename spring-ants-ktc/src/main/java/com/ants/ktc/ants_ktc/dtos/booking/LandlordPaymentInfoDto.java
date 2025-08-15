package com.ants.ktc.ants_ktc.dtos.booking;

import java.util.UUID;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LandlordPaymentInfoDto {
    private UUID landlordId;
    private String landlordName;
    private String accountHolderName;
    private String bankNumber;
    private String bankName;
    private String binCode;
    private Double depositAmount;
    private String phoneNumber;
    private String email;
}
