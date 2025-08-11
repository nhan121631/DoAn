package com.ants.ktc.ants_ktc.dtos.user;

import java.util.UUID;

import com.ants.ktc.ants_ktc.dtos.userprofile.LandlordProfileResponseDto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class LandlordResponseDto {
    private UUID id;
    private LandlordProfileResponseDto landlordProfile;

}
