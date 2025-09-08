package com.ants.ktc.ants_ktc.dtos.contract;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class PaymentInfoDto {
    private String bankName;
    private String bankNumber;
    private String binCode;
    private String accountHolderName;
    private String phoneNumber;
}