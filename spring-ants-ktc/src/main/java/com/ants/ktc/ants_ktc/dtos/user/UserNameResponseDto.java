package com.ants.ktc.ants_ktc.dtos.user;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserNameResponseDto {
    private UUID userId;
    private String fullName;
    private String avatar;
}
