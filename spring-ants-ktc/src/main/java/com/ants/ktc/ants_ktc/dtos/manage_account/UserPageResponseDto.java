package com.ants.ktc.ants_ktc.dtos.manage_account;

import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor; // Thêm import này
import lombok.AllArgsConstructor; // Thêm import này
import java.util.List;

@Data // Tự động tạo getters, setters, toString, equals, hashCode
@Builder // Tự động tạo builder pattern
@NoArgsConstructor // Tự động tạo constructor không đối số
@AllArgsConstructor // Tự động tạo constructor với tất cả các trường
public class UserPageResponseDto {
    private List<UserResponseDto> data;
    private int pageNumber;
    private int pageSize;
    private long totalRecords;
    private int totalPages;
    private boolean hasNext;
    private boolean hasPrevious;

}