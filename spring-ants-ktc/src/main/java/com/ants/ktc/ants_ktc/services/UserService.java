package com.ants.ktc.ants_ktc.services;

import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import com.ants.ktc.ants_ktc.dtos.address.AddressResponseDto;
import com.ants.ktc.ants_ktc.dtos.address.DistrictResponseDto;
import com.ants.ktc.ants_ktc.dtos.address.ProvinceResponseDto;
import com.ants.ktc.ants_ktc.dtos.address.WardResponseDto;
import com.ants.ktc.ants_ktc.dtos.auth.GoogleLoginRequestDto;
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

        private final RestTemplate restTemplate = new RestTemplate();

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

        public LoginResponseDto googleLogin(GoogleLoginRequestDto requestDto) {
                String credential = requestDto.getCredential();
                String url = "https://oauth2.googleapis.com/tokeninfo?id_token=" + credential;
                ResponseEntity<Map> response = restTemplate.getForEntity(url, Map.class);
                Map<String, Object> payload = response.getBody();
                if (response.getStatusCode() != HttpStatus.OK) {
                        throw new HttpException("Invalid Google token", HttpStatus.UNAUTHORIZED);
                }

                String email;
                if (payload != null && payload.containsKey("email")) {
                        email = payload.get("email").toString();
                } else {
                        throw new HttpException("Email not found in token", HttpStatus.UNAUTHORIZED);
                }

                String iss = payload.get("iss").toString();
                if (!iss.equals("https://accounts.google.com") && !iss.equals("accounts.google.com")) {
                        throw new HttpException("Invalid Google token issuer", HttpStatus.UNAUTHORIZED);
                }

                long exp = Long.parseLong(payload.get("exp").toString());
                if (exp < System.currentTimeMillis() / 1000) {
                        throw new HttpException("Google token has expired", HttpStatus.UNAUTHORIZED);
                }

                User user = userJpaRepository.findByEmail(email)
                                .orElseThrow(() -> new IllegalArgumentException(
                                                "User not found with email: " + email));

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
}