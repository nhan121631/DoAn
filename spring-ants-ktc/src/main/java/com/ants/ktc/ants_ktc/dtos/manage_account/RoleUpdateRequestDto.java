package com.ants.ktc.ants_ktc.dtos.manage_account;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data // Tự động tạo getters, setters, toString, equals, hashCode
@NoArgsConstructor // Constructor không tham số
@AllArgsConstructor // Constructor với tất cả tham số
public class RoleUpdateRequestDto {
    private List<String> roleNames; // Tên các vai trò mới
}