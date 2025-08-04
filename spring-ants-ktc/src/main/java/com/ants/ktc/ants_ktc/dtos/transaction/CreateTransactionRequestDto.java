package com.ants.ktc.ants_ktc.dtos.transaction;

import java.sql.Date;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Builder
@Data
@AllArgsConstructor
@NoArgsConstructor
public class CreateTransactionRequestDto {
    @DecimalMin(value = "5000.0", message = "Amount must be at least 5,000 VND")
    private Double amount;
    private int transactionType;
    private String bankTransactionName;
    private String transactionCode;
    private Date transactionDate;

    @NotNull(message = "Transaction date is required")
    private int status;

    @Size(max = 255, message = "Description must be less than 255 characters")
    private String description;
}
