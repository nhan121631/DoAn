package com.ants.ktc.ants_ktc.dtos.manage_account;

import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.util.UUID;
import java.util.ArrayList;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserResponseDto {
    private UUID id;
    private String username;
    private String email;
    private String phoneNumber;
    private String status;
    private List<String> roles;

    // mới thêm đoạn này
    public UserResponseDto(UUID id, String username, String email, String phoneNumber, String status, String roleName) {
        this.id = id;
        this.username = username;
        this.email = email;
        this.phoneNumber = phoneNumber;
        this.status = status;

        // Khởi tạo List<String> cho roles
        this.roles = new ArrayList<>();
        if (roleName != null) {
            this.roles.add(roleName);
        }
    }

}