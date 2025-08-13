package com.ants.ktc.ants_ktc.controllers;

import java.util.Map;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.ants.ktc.ants_ktc.dtos.auth.GoogleLoginRequestDto;
import com.ants.ktc.ants_ktc.dtos.auth.LoginRequestDto;
import com.ants.ktc.ants_ktc.dtos.auth.LoginResponseDto;
import com.ants.ktc.ants_ktc.dtos.auth.RegisterRequestDto;
import com.ants.ktc.ants_ktc.dtos.auth.RegisterResponseDto;
import com.ants.ktc.ants_ktc.services.UserService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/auth")
public class AuthController {
    @Autowired
    private UserService userService;

    @PostMapping("/login")
    public ResponseEntity<LoginResponseDto> login(@RequestBody LoginRequestDto request) throws Exception {
        LoginResponseDto result = this.userService.login(request);
        return ResponseEntity.ok(result);
    }

    @PostMapping("/google-login")
    public ResponseEntity<LoginResponseDto> googleLogin(@RequestBody @Valid GoogleLoginRequestDto request) {
        LoginResponseDto result = this.userService.googleLogin(request);
        return ResponseEntity.ok(result);
    }

    @PostMapping("/register")
    public ResponseEntity<RegisterResponseDto> register(@RequestBody @Valid RegisterRequestDto request) {
        RegisterResponseDto result = this.userService.register(request);
        return ResponseEntity.ok(result);
    }

    @PostMapping("/reset-password/{email}")
    public ResponseEntity<Object> resetPassword(@PathVariable("email") String email) {
        this.userService.resetPassword(email);
        return ResponseEntity.ok(
                Map.of("message", "Password reset email sent"));
    }

    @PostMapping("/verify-reset-code")
    public ResponseEntity<Object> verifyResetCode(@RequestBody Map<String, String> request) {
        String email = request.get("email");
        String code = request.get("code");
        boolean isValid = this.userService.verifyResetCode(email, code);
        if (isValid) {
            return ResponseEntity.ok(Map.of("message", "Reset code is valid"));
        } else {
            return ResponseEntity.badRequest().body(Map.of("message", "Invalid reset code"));
        }
    }

    @PostMapping("/update-password")
    public ResponseEntity<Object> updatePassword(@RequestBody Map<String, String> request) {
        String email = request.get("email");
        String newPassword = request.get("newPassword");
        String code = request.get("code");

        boolean isChanged = this.userService.updatePassword(email, newPassword, code);
        if (isChanged) {
            return ResponseEntity.ok(Map.of("message", "Password changed successfully"));
        } else {
            return ResponseEntity.badRequest().body(Map.of("message", "Failed to change password"));
        }
    }

    @PatchMapping("/change-password")
    public ResponseEntity<Object> changePassword(@RequestBody Map<String, String> request) {
        String userIdStr = request.get("userId");
        String password = request.get("password");
        UUID userId = UUID.fromString(userIdStr);
        String newPassword = request.get("newPassword");
        boolean isChanged = this.userService.changePassword(userId, password, newPassword);
        if (isChanged) {
            return ResponseEntity.ok(Map.of("message", "Password changed successfully"));
        } else {
            return ResponseEntity.badRequest().body(Map.of("message", "Failed to change password"));
        }

    }
}
