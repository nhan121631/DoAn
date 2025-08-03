package com.ants.ktc.ants_ktc.dtos.auth;

import java.util.List;
import java.util.UUID;

import com.ants.ktc.ants_ktc.dtos.userprofile.UserProfileResponseDto;

import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Builder
public class LoginResponseDto {
    UUID id;
    String username;
    int isActive;
    private List<String> roles;
    UserProfileResponseDto userProfile;
    String accessToken;
    String refreshToken;
}