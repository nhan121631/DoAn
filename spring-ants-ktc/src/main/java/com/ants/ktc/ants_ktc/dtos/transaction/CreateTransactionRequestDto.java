package com.ants.ktc.ants_ktc.dtos.transaction;


import java.sql.Date;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Builder
@Data
@AllArgsConstructor
@NoArgsConstructor
public class CreateTransactionRequestDto {
    private double amount;
    private int transactionType;
    private String bankTransactionName;
    private String transactionCode;
    private Date transactionDate;
    private int status;
    private String description;
}
