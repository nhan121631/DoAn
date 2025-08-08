package com.ants.ktc.ants_ktc.dtos.room;

import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PaginationRoomResponseDto {
    private List<RoomResponseProjectionDto> rooms;
    // private List<TransactionResponseDto> transactions;
    private int pageNumber;
    private int pageSize;
    private long totalRecords;
    private int totalPages;
    private boolean hasNext;
    private boolean hasPrevious;
}
