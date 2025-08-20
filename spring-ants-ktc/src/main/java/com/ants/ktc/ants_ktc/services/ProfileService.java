package com.ants.ktc.ants_ktc.services;

import java.io.IOException;
import java.util.Map;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
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
        private LocationIQService locationIQService;
        @Autowired
        private ProfileJpaRepository profileJpaRepository;

        @Autowired
        private WardJpaRepository wardRepository;

        @Autowired
        private CloudinaryService cloudinaryService;

        private AddressResponseDto addressConvert(Address address) {
                if (address == null)
                        return null;
                Ward ward = address.getWard();
                WardResponseDto wardDto = null;
                if (ward != null) {
                        wardDto = WardResponseDto.builder()
                                        .id(ward.getId())
                                        .name(ward.getName())
                                        .district(DistrictResponseDto.builder()
                                                        .id(ward.getDistrict().getId())
                                                        .name(ward.getDistrict().getName())
                                                        .province(ProvinceResponseDto.builder()
                                                                        .id(ward.getDistrict().getProvince().getId())
                                                                        .name(ward.getDistrict().getProvince()
                                                                                        .getName())
                                                                        .build())
                                                        .build())
                                        .build();
                }
                return AddressResponseDto.builder()
                                .id(address.getId())
                                .street(address.getStreet())
                                .ward(wardDto)
                                .build();
        }

        private String removePrefix(String text, String prefix) {
                if (text == null)
                        return null;
                if (text.startsWith(prefix)) {
                        return text.substring(prefix.length()).trim();
                }
                return text;
        }

        public UserProfileResponseDto updateProfile(MultipartFile avatar, ProfileUpdateRequestDto dto)
                        throws IOException {

                UserProfile profile = profileJpaRepository.findById(dto.getId())
                                .orElseThrow(() -> new IllegalArgumentException("Profile not found"));

                if (avatar != null && !avatar.isEmpty()) {
                        try {
                                // Upload ảnh lên Cloudinary
                                Map<String, String> uploadResult = cloudinaryService.uploadFile(avatar);
                                String avatarUrl = uploadResult.get("url");
                                profile.setAvatar(avatarUrl); // cập nhật avatar cho profile
                        } catch (Exception e) {
                                throw new RuntimeException("Failed to upload avatar: " + e.getMessage(), e);
                        }

                        // code cũ
                        // String fileName = System.currentTimeMillis() + "_" +
                        // avatar.getOriginalFilename();
                        // Path filePath = Paths.get("public/uploads/" + fileName);
                        // Files.createDirectories(filePath.getParent());
                        // Files.write(filePath, avatar.getBytes());

                        // String avatarUrl = "/uploads/" + fileName;
                        // profile.setAvatar(avatarUrl); // cập nhật avatar cho profile
                }

                profile.setId(dto.getId());
                profile.setFullName(dto.getFullName());
                // Kiểm tra email đã tồn tại cho user khác chưa
                if (dto.getEmail() != null && !dto.getEmail().equals(profile.getEmail())) {
                        boolean emailExists = profileJpaRepository.existsByEmailAndIdNot(dto.getEmail(),
                                        profile.getId());
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
                if (dto.getBankName() != null) {
                        profile.setBankName(dto.getBankName());
                }
                if (dto.getBinCode() != null) {
                        profile.setBinCode(dto.getBinCode());
                }
                if (dto.getBankNumber() != null) {
                        profile.setBankNumber(dto.getBankNumber());
                }
                if (dto.getAccoutHolderName() != null) {
                        profile.setAccoutHolderName(dto.getAccoutHolderName());
                }

                AddressResponseDto addressDto = null;
                if (dto.getAddress() != null && dto.getAddress().getWardId() != null) {
                        Address address = profile.getAddress();
                        if (address == null) {
                                address = new Address();
                                profile.setAddress(address);
                        }
                        address.setStreet(dto.getAddress().getStreet());
                        // Lấy ward từ DB
                        Ward ward = wardRepository.findById(dto.getAddress().getWardId())
                                        .orElseThrow(() -> new RuntimeException("Ward Not Found"));
                        address.setWard(ward);

                        String fullAddress = dto.getAddress().getStreet() + ", " +
                                        removePrefix(ward.getName(), "Phường") + ", " +
                                        removePrefix(ward.getDistrict().getName(), "Quận") + ", " +
                                        removePrefix(ward.getDistrict().getProvince().getName(), "Thành phố");
                        try {
                                LocationIQService.LatLng latLng = locationIQService.getCoordinates(fullAddress);

                                if (latLng != null) {
                                        address.setLng(latLng.lng);
                                        address.setLat(latLng.lat);
                                }

                                profileJpaRepository.save(profile);
                                addressDto = addressConvert(address);
                        } catch (Exception e) {
                                throw new RuntimeException("Failed to get coordinates: " + e.getMessage(), e);
                        }
                } else {
                        profileJpaRepository.save(profile);
                        Address address = profile.getAddress();
                        addressDto = addressConvert(address);
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
                                .address(addressDto)
                                .build();
        }

        public UserProfileResponseDto getProfile(UUID id) {
                UserProfile profile = profileJpaRepository.findById(id)
                                .orElseThrow(() -> new IllegalArgumentException("Profile not found"));

                Address address = profile.getAddress();
                AddressResponseDto addressDto = addressConvert(address);
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
}
