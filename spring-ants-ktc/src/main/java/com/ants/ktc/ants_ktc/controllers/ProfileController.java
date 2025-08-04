package com.ants.ktc.ants_ktc.controllers;

import java.io.IOException;
import java.util.Set;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.ants.ktc.ants_ktc.dtos.userprofile.ProfileUpdateRequestDto;
import com.ants.ktc.ants_ktc.dtos.userprofile.UserProfileResponseDto;
import com.ants.ktc.ants_ktc.services.ProfileService;
import com.fasterxml.jackson.databind.ObjectMapper;

import jakarta.validation.ConstraintViolation;
import jakarta.validation.Validator;

@RestController
@RequestMapping("/api/profile")
public class ProfileController {

    @Autowired
    private ProfileService profileService;

    @Autowired
    private Validator validator;

    @PatchMapping("/update")

    public ResponseEntity<UserProfileResponseDto> updateProfile(
            @RequestPart(value = "avatar", required = false) MultipartFile avatar,
            @RequestPart("profile") String profileJson) throws IOException {
        ObjectMapper objectMapper = new ObjectMapper();
        ProfileUpdateRequestDto dto = objectMapper.readValue(profileJson, ProfileUpdateRequestDto.class);

        Set<ConstraintViolation<ProfileUpdateRequestDto>> violations = validator.validate(dto);
        if (!violations.isEmpty()) {
            String errorMsg = violations.stream()
                    .map(v -> v.getPropertyPath() + ": " + v.getMessage())
                    .reduce((a, b) -> a + ", " + b)
                    .orElse("Validation error");
            throw new IllegalArgumentException(errorMsg);
        }

        UserProfileResponseDto result = profileService.updateProfile(avatar, dto);
        return ResponseEntity.ok(result);
    }

    @GetMapping("{id}")
    public ResponseEntity<UserProfileResponseDto> getProfile(@PathVariable("id") UUID id) {
        UserProfileResponseDto profile = profileService.getProfile(id);
        return ResponseEntity.ok(profile);
    }
}
