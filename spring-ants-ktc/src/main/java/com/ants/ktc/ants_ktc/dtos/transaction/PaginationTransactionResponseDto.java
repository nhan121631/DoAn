package com.ants.ktc.ants_ktc.dtos.transaction;

import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PaginationTransactionResponseDto {
    private List<TransactionResponseDto> transactions;
    private int pageNumber;
    private int pageSize;
    private long totalRecords;
    private int totalPages;
    private boolean hasNext;
    private boolean hasPrevious;
}
