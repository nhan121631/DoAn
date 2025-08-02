package com.ants.ktc.ants_ktc.controllers.admin;

import com.ants.ktc.ants_ktc.dtos.manage_account.UserPageResponseDto;
import com.ants.ktc.ants_ktc.dtos.manage_account.UserResponseDto;
import com.ants.ktc.ants_ktc.dtos.request.UpdateUserStatusRequestDto;
import com.ants.ktc.ants_ktc.services.AccountManagementService;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/admin/accounts")
@PreAuthorize("hasAuthority('Administrators')")
public class AccountManagementController {

    private final AccountManagementService accountManagementService;

    @Autowired
    public AccountManagementController(AccountManagementService accountManagementService) {
        this.accountManagementService = accountManagementService;
    }

    // API 1: Lấy danh sách tài khoản có phân trang
    // GET /api/admin/accounts?page=0&size=10
    @GetMapping
    public ResponseEntity<UserPageResponseDto> getPaginatedUsers(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {

        UserPageResponseDto response = accountManagementService.getPaginatedUsers(page, size);
        return ResponseEntity.ok(response);
    }

    // API 2: Lấy thông tin tài khoản theo ID
    // GET /api/admin/accounts/{id}
    @GetMapping("/{id}")
    public ResponseEntity<UserResponseDto> getUserById(@PathVariable UUID id) {
        try {
            UserResponseDto userDto = accountManagementService.getUserById(id);
            return ResponseEntity.ok(userDto);
        } catch (EntityNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build(); // Trả về 404 nếu không tìm thấy user
        }
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<UserResponseDto> updateUserStatus(
            @PathVariable UUID id,
            @RequestBody UpdateUserStatusRequestDto request) { // DTO để nhận status
        try {
            UserResponseDto updatedUser = accountManagementService.updateUserStatus(id, request.getStatus());
            return ResponseEntity.ok(updatedUser);
        } catch (EntityNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build(); // 404 Not Found
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build(); // 400 Bad Request nếu status không hợp lệ
        } catch (Exception e) {

            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build(); // 500 Internal Server Error
        }
    }
}