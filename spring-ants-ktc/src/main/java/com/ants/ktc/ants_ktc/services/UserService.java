package com.ants.ktc.ants_ktc.services;

import java.util.UUID;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import com.ants.ktc.ants_ktc.dtos.address.AddressResponseDto;
import com.ants.ktc.ants_ktc.dtos.address.DistrictResponseDto;
import com.ants.ktc.ants_ktc.dtos.address.ProvinceResponseDto;
import com.ants.ktc.ants_ktc.dtos.address.WardResponseDto;
import com.ants.ktc.ants_ktc.dtos.auth.LoginRequestDto;
import com.ants.ktc.ants_ktc.dtos.auth.LoginResponseDto;
import com.ants.ktc.ants_ktc.dtos.userprofile.UserProfileResponseDto;
import com.ants.ktc.ants_ktc.entities.Role;
import com.ants.ktc.ants_ktc.entities.User;
import com.ants.ktc.ants_ktc.entities.address.District;
import com.ants.ktc.ants_ktc.entities.address.Province;
import com.ants.ktc.ants_ktc.entities.address.Ward;
import com.ants.ktc.ants_ktc.exceptions.HttpException;
import com.ants.ktc.ants_ktc.repositories.UserJpaRepository;
import com.ants.ktc.ants_ktc.services.auth.JwtService;

@Service
public class UserService {
        @Autowired
        private UserJpaRepository userJpaRepository;

        @Autowired
        private JwtService jwtService;

        public LoginResponseDto login(LoginRequestDto request) throws Exception {
                User user = this.userJpaRepository.findByUsername(request.getUsername())
                                .orElseThrow(() -> new HttpException("Invalid username or password",
                                                HttpStatus.UNAUTHORIZED));

                if (!request.getPassword().equals(user.getPassword())) {
                        throw new HttpException("Invalid username or password", HttpStatus.UNAUTHORIZED);
                }

                String accessToken = jwtService.generateAccessToken(user);
                String refreshToken = jwtService.generateRefreshToken(user);

                UserProfileResponseDto userProfileDto = null;
                AddressResponseDto addressDto = null;

                if (user.getProfile() != null) {
                        if (user.getProfile().getAddress() != null
                                        && user.getProfile().getAddress().getWard() != null) {
                                Ward ward = user.getProfile().getAddress().getWard();
                                District district = ward.getDistrict();
                                Province province = district.getProvince();

                                WardResponseDto wardDto = WardResponseDto.builder()
                                                .id(ward.getId())
                                                .name(ward.getName())
                                                .district(DistrictResponseDto.builder()
                                                                .id(district.getId())
                                                                .name(district.getName())
                                                                .province(ProvinceResponseDto.builder()
                                                                                .id(province.getId())
                                                                                .name(province.getName())
                                                                                .build())
                                                                .build())
                                                .build();

                                addressDto = AddressResponseDto.builder()
                                                .id(user.getProfile().getAddress().getId())
                                                .street(user.getProfile().getAddress().getStreet()) // Thêm dòng này!
                                                .ward(wardDto)
                                                .build();
                        }

                        userProfileDto = UserProfileResponseDto.builder()
                                        .id(user.getProfile().getId())
                                        .fullName(user.getProfile().getFullName())
                                        .email(user.getProfile().getEmail())
                                        .phoneNumber(user.getProfile().getPhoneNumber())
                                        .avatar(user.getProfile().getAvatar())
                                        .bankName(user.getProfile().getBankName())
                                        .bankNumber(user.getProfile().getBankNumber())
                                        .binCode(user.getProfile().getBinCode())
                                        .accoutHolderName(user.getProfile().getAccoutHolderName())
                                        .address(addressDto)
                                        .build();
                }

                return LoginResponseDto.builder()
                                .id(user.getId())
                                .username(user.getUsername())
                                .userProfile(userProfileDto)
                                .roles(user.getRoles() != null
                                                ? user.getRoles().stream().map(Role::getName).toList()
                                                : null)
                                .accessToken(accessToken)
                                .refreshToken(refreshToken)
                                .build();
        }

        public UUID getAuthenticatedUserId() {
                Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
                String username = authentication.getName(); // Lấy username từ Principal

                User user = userJpaRepository.findByUsername(username) // Sử dụng userJpaRepository đã được @Autowired
                                .orElseThrow(() -> new UsernameNotFoundException(
                                                "User not found in database for username: " + username));

                return user.getId();
        }
}