package com.ants.ktc.ants_ktc.controllers.admin;

import java.util.UUID;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.ants.ktc.ants_ktc.dtos.manage_account.RoleUpdateRequestDto;
import com.ants.ktc.ants_ktc.dtos.manage_account.UpdateUserStatusRequestDto;
import com.ants.ktc.ants_ktc.dtos.manage_account.UserPageResponseDto;
import com.ants.ktc.ants_ktc.dtos.manage_account.UserResponseDto;
import com.ants.ktc.ants_ktc.services.AccountManagementService;

@RestController
@RequestMapping("/api/admin/accounts")
// @PreAuthorize("hasAuthority('Administrators')")
public class AccountManagementController {

    private final AccountManagementService accountManagementService;

    public AccountManagementController(AccountManagementService accountManagementService) {
        this.accountManagementService = accountManagementService;
    }

    @GetMapping
    public ResponseEntity<UserPageResponseDto> getPaginatedUsers(
            @RequestParam(name = "page", defaultValue = "0") int page,
            @RequestParam(name = "size", defaultValue = "7") int size) {

        UserPageResponseDto response = accountManagementService.getPaginatedUsers(page, size);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{id}")
    public ResponseEntity<UserResponseDto> getUserById(@PathVariable("id") UUID id) {
        UserResponseDto userDto = accountManagementService.getUserById(id);
        return ResponseEntity.ok(userDto);
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<UserResponseDto> updateUserStatus(
            @PathVariable("id") UUID id,
            @RequestBody UpdateUserStatusRequestDto request) {
        UserResponseDto updatedUser = accountManagementService.updateUserStatus(id, request.getStatus());
        return ResponseEntity.ok(updatedUser);
    }

    @PatchMapping("/{id}/roles")
    public ResponseEntity<UserResponseDto> updateUserRoles(
            @PathVariable("id") UUID id,
            @RequestBody RoleUpdateRequestDto request) {
        UserResponseDto updatedUser = accountManagementService.updateUserRoles(id, request.getRoleNames());
        return ResponseEntity.ok(updatedUser);
    }
}