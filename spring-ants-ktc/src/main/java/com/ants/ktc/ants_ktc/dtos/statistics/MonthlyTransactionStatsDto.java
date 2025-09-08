package com.ants.ktc.ants_ktc.dtos.statistics;

import java.math.BigDecimal;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class MonthlyTransactionStatsDto {
    private String month;
    private Integer transactionType;
    private String description;
    private BigDecimal totalAmount;
}
