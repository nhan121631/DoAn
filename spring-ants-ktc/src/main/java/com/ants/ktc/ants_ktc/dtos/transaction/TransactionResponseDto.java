package com.ants.ktc.ants_ktc.dtos.transaction;

import java.util.Date;

import com.ants.ktc.ants_ktc.dtos.wallet.WalletResponseDto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Builder
@Data
@AllArgsConstructor
@NoArgsConstructor
public class TransactionResponseDto {
    private Double amount;
    private int transactionType;
    private String bankTransactionName;
    private String transactionCode;
    private Date transactionDate;
    private int status;
    private String description;
    private WalletResponseDto wallet;
}
