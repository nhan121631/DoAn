package com.ants.ktc.ants_ktc.controllers;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
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

}
