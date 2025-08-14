package com.ants.ktc.ants_ktc.dtos.user;

import java.util.UUID;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserBookingResponseDto {
    private UUID userId;
    private String fullName;
    // private String email;
    private String phoneNumber;
}
