package com.ants.ktc.ants_ktc.dtos.userprofile;

import java.util.UUID;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class LandlordProfileResponseDto {
    private UUID id;
    private String fullName;
    private String email;
    private String phoneNumber;
    private String avatar;
}
