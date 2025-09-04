package com.ants.ktc.ants_ktc.controllers;

import java.io.IOException;
import java.util.Map;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.ants.ktc.ants_ktc.dtos.user.UserNameResponseDto;
import com.ants.ktc.ants_ktc.dtos.userprofile.ProfileUpdateRequestDto;
import com.ants.ktc.ants_ktc.dtos.userprofile.UserPreferencesUpdateDto;
import com.ants.ktc.ants_ktc.dtos.userprofile.UserProfileResponseDto;
import com.ants.ktc.ants_ktc.services.ProfileService;
import com.fasterxml.jackson.databind.ObjectMapper;

import jakarta.validation.ConstraintViolation;
import jakarta.validation.Validator;
import org.springframework.web.bind.annotation.RequestParam;


@RestController
@RequestMapping("/api/profile")
public class ProfileController {

    @Autowired
    private ProfileService profileService;

    @Autowired
    private Validator validator;

    @GetMapping("/getname/{id}")
    public ResponseEntity<?> getUserProfileById(@PathVariable("id") UUID id) {
        Optional<UserNameResponseDto> userProfile = profileService.getFullNameById(id);

        if (userProfile.isPresent()) {
            return ResponseEntity.ok(userProfile.get());
        } else {
            return ResponseEntity.notFound().build();
        }
    }

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

    @GetMapping("/{id}")
    public ResponseEntity<UserProfileResponseDto> getProfile(@PathVariable("id") UUID id) {
        UserProfileResponseDto profile = profileService.getProfile(id);
        return ResponseEntity.ok(profile);
    }

    /**
     * Cập nhật preferences của user (địa chỉ tìm kiếm và giá mong muốn)
     */
    @PostMapping("/{userId}/preferences")
    public ResponseEntity<?> updateUserPreferences(
            @PathVariable("userId") UUID userId,
            @RequestBody UserPreferencesUpdateDto preferencesDto) {
        try {
            profileService.updateUserPreferences(userId, preferencesDto);
            return ResponseEntity.ok(Map.of("message", "User preferences updated successfully"));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(Map.of("message", "Error updating preferences: " + e.getMessage()));
        }
    }

    // get search address by userId
    @GetMapping("/{userId}/preferences")
    public ResponseEntity<UserPreferencesUpdateDto> getUserPreferences(@PathVariable("userId") UUID userId) {
        try {
            String searchAddress = profileService.getSearchAddress(userId);
            return ResponseEntity.ok(new UserPreferencesUpdateDto(searchAddress));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(new UserPreferencesUpdateDto("Error fetching preferences: " + e.getMessage()));
        }
    }

    @GetMapping("/ishavebank/{userId}")
    public ResponseEntity<Boolean> isHaveBankAccount(@PathVariable("userId") UUID userId) {
        boolean hasBankAccount = profileService.isHaveBankAccount(userId);
        return ResponseEntity.ok(hasBankAccount);
    }

    @PatchMapping("/{userId}/email-notifications")
    public ResponseEntity<?> setEmailNotifications(
            @PathVariable("userId") UUID userId,
            @RequestBody Map<String, Boolean> request) {
        Boolean enabled = request.get("enabled");
        if (enabled == null) {
            return ResponseEntity.badRequest().body(Map.of("message", "Missing 'enabled' field in request body"));
        }
        try {
            profileService.setEmailNotifications(userId, enabled);
            return ResponseEntity.ok(Map.of("message", "Email notification preference updated successfully"));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(Map.of("message", "Error updating email notification preference: " + e.getMessage()));
        }
    }

    @GetMapping("/email-notifications")
    public Boolean getEmailNotifications(@RequestParam("userId") UUID userId) {
        return profileService.getEmailNotifications(userId);
    }

}
