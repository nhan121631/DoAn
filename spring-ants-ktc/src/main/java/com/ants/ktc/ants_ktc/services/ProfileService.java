package com.ants.ktc.ants_ktc.services;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.multipart.MultipartFile;

import com.ants.ktc.ants_ktc.dtos.address.AddressResponseDto;
import com.ants.ktc.ants_ktc.dtos.address.DistrictResponseDto;
import com.ants.ktc.ants_ktc.dtos.address.ProvinceResponseDto;
import com.ants.ktc.ants_ktc.dtos.address.WardResponseDto;
import com.ants.ktc.ants_ktc.dtos.userprofile.ProfileUpdateRequestDto;
import com.ants.ktc.ants_ktc.dtos.userprofile.UserProfileResponseDto;
import com.ants.ktc.ants_ktc.entities.UserProfile;
import com.ants.ktc.ants_ktc.entities.address.Address;
import com.ants.ktc.ants_ktc.entities.address.Ward;
import com.ants.ktc.ants_ktc.repositories.ProfileJpaRepository;
import com.ants.ktc.ants_ktc.repositories.address.WardJpaRepository;

@Service
public class ProfileService {
    @Autowired
    private ProfileJpaRepository profileJpaRepository;

    @Autowired
    private WardJpaRepository wardRepository;

    public UserProfileResponseDto updateProfile(MultipartFile avatar, ProfileUpdateRequestDto dto) throws IOException {

        UserProfile profile = profileJpaRepository.findById(dto.getId())
                .orElseThrow(() -> new IllegalArgumentException("Profile not found"));

        if (avatar != null && !avatar.isEmpty()) {
            String fileName = System.currentTimeMillis() + "_" + avatar.getOriginalFilename();
            Path filePath = Paths.get("public/uploads/" + fileName);
            Files.createDirectories(filePath.getParent());
            Files.write(filePath, avatar.getBytes());

            String avatarUrl = "/uploads/" + fileName;
            profile.setAvatar(avatarUrl); // cập nhật avatar cho profile
        }

        profile.setId(dto.getId());
        profile.setFullName(dto.getFullName());
        // Kiểm tra email đã tồn tại cho user khác chưa
        if (dto.getEmail() != null && !dto.getEmail().equals(profile.getEmail())) {
            boolean emailExists = profileJpaRepository.existsByEmailAndIdNot(dto.getEmail(), profile.getId());
            if (emailExists) {
                throw new IllegalArgumentException("Email already exists");
            }
            profile.setEmail(dto.getEmail());
        }

        // Kiểm tra phoneNumber đã tồn tại cho user khác chưa
        if (dto.getPhoneNumber() != null && !dto.getPhoneNumber().equals(profile.getPhoneNumber())) {
            boolean phoneExists = profileJpaRepository.existsByPhoneNumberAndIdNot(dto.getPhoneNumber(),
                    profile.getId());
            if (phoneExists) {
                throw new IllegalArgumentException("Phone number already exists");
            }
            profile.setPhoneNumber(dto.getPhoneNumber());
        }
        profile.setBankName(dto.getBankName());
        profile.setBinCode(dto.getBinCode());
        profile.setBankNumber(dto.getBankNumber());
        profile.setAccoutHolderName(dto.getAccoutHolderName());

        Address address = profile.getAddress();
        if (address == null) {
            address = new Address();
            // address.setId(UUID.randomUUID());
            profile.setAddress(address);
        }

        address.setStreet(dto.getAddress().getStreet());

        // Lấy ward từ DB
        Ward ward = wardRepository.findById(dto.getAddress().getWardId())
                .orElseThrow(() -> new RuntimeException("Ward Not Found"));
        address.setWard(ward);
        profileJpaRepository.save(profile);

        AddressResponseDto addressDto = AddressResponseDto.builder()
                .id(address.getId())
                .street(address.getStreet())
                .ward(WardResponseDto.builder()
                        .id(ward.getId())
                        .name(ward.getName())
                        .district(DistrictResponseDto.builder()
                                .id(ward.getDistrict().getId())
                                .name(ward.getDistrict().getName())
                                .province(ProvinceResponseDto.builder()
                                        .id(ward.getDistrict().getProvince().getId())
                                        .name(ward.getDistrict().getProvince().getName())
                                        .build())
                                .build())
                        .build())
                .build();

        return UserProfileResponseDto.builder()
                .id(profile.getId())
                .fullName(profile.getFullName())
                .email(profile.getEmail())
                .phoneNumber(profile.getPhoneNumber())
                .avatar(profile.getAvatar())
                .bankName(profile.getBankName())
                .binCode(profile.getBinCode())
                .bankNumber(profile.getBankNumber())
                .accoutHolderName(profile.getAccoutHolderName())
                .address(addressDto)
                .build();
    }

    public UserProfileResponseDto getProfile(UUID id) {
        UserProfile profile = profileJpaRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Profile not found"));

        Address address = profile.getAddress();
        if (address == null) {
            address = new Address();
        }

        Ward ward = address.getWard();
        if (ward == null) {
            ward = new Ward();
        }

        return UserProfileResponseDto.builder()
                .id(profile.getId())
                .fullName(profile.getFullName())
                .email(profile.getEmail())
                .phoneNumber(profile.getPhoneNumber())
                .avatar(profile.getAvatar())
                .bankName(profile.getBankName())
                .binCode(profile.getBinCode())
                .bankNumber(profile.getBankNumber())
                .accoutHolderName(profile.getAccoutHolderName())
                .address(AddressResponseDto.builder()
                        .id(address.getId())
                        .street(address.getStreet())
                        .ward(WardResponseDto.builder()
                                .id(ward.getId())
                                .name(ward.getName())
                                .district(DistrictResponseDto.builder()
                                        .id(ward.getDistrict().getId())
                                        .name(ward.getDistrict().getName())
                                        .province(ProvinceResponseDto.builder()
                                                .id(ward.getDistrict().getProvince().getId())
                                                .name(ward.getDistrict().getProvince().getName())
                                                .build())
                                        .build())
                                .build())
                        .build())
                .build();
    }
}
