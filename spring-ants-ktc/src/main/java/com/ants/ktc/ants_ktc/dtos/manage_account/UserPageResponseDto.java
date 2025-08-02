package com.ants.ktc.ants_ktc.dtos.manage_account;

import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserPageResponseDto {
    private List<UserResponseDto> data;
    private int pageNumber;
    private int pageSize;
    private long totalRecords;
    private int totalPages;
    private boolean hasNext;
    private boolean hasPrevious;

}