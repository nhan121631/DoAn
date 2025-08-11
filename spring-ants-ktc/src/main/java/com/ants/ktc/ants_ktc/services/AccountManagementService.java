package com.ants.ktc.ants_ktc.services;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.ants.ktc.ants_ktc.dtos.manage_account.UserPageResponseDto;
import com.ants.ktc.ants_ktc.dtos.manage_account.UserResponseDto;
import com.ants.ktc.ants_ktc.entities.Role;
import com.ants.ktc.ants_ktc.entities.User;
import com.ants.ktc.ants_ktc.repositories.RoleJpaRepository;
import com.ants.ktc.ants_ktc.repositories.UserJpaRepository;

@Service
public class AccountManagementService {

    private final UserJpaRepository userJpaRepository;
    private final RoleJpaRepository roleJpaRepository;

    public AccountManagementService(UserJpaRepository userJpaRepository, RoleJpaRepository roleJpaRepository) {
        this.userJpaRepository = userJpaRepository;
        this.roleJpaRepository = roleJpaRepository;

    }

    @Transactional(readOnly = true)
    public List<UserResponseDto> getAllUsers() {
        List<User> users = userJpaRepository.findAllExcludingAdmins();

        return users.stream()
                .map(this::convertToUserResponseDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public UserPageResponseDto getPaginatedUsers(Pageable pageable) {
        Page<User> usersPage = userJpaRepository.findAllExcludingAdmins(pageable);
        List<UserResponseDto> userDtos = usersPage.getContent().stream()
                .map(this::convertToUserResponseDto)
                .collect(Collectors.toList());

        return UserPageResponseDto.builder()
                .data(userDtos)
                .pageNumber(usersPage.getNumber())
                .pageSize(usersPage.getSize())
                .totalRecords(usersPage.getTotalElements())
                .totalPages(usersPage.getTotalPages())
                .hasNext(usersPage.hasNext())
                .hasPrevious(usersPage.hasPrevious())
                .build();
    }

    @Transactional(readOnly = true)
    public UserResponseDto getUserById(UUID userId) {

        return userJpaRepository.findById(userId)
                .map(this::convertToUserResponseDto)
                .orElseThrow(() -> new IllegalArgumentException("User with ID " + userId + " not found."));
    }

    public UserResponseDto updateUserStatus(UUID userId, int status) {
        User user = userJpaRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException(
                        "User with ID " + userId + " not found."));
        user.setIsActive(status);
        User updatedUser = userJpaRepository.save(user);
        return convertToUserResponseDto(updatedUser);
    }

    public UserResponseDto updateUserRoles(UUID userId, List<String> roleNames) {
        User user = userJpaRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException(
                        "User with ID " + userId + " not found."));

        List<Role> newRoles = new ArrayList<>();
        for (String roleName : roleNames) {
            Role role = roleJpaRepository.findByName(roleName)
                    .orElseThrow(() -> new IllegalArgumentException(
                            "Role not found with name: " + roleName));
            newRoles.add(role);
        }

        user.setRoles(newRoles);
        User updatedUser = userJpaRepository.save(user);

        return convertToUserResponseDto(updatedUser);
    }

    private UserResponseDto convertToUserResponseDto(User user) {

        String statusString = (user.getIsActive() == 0) ? "Active" : "Disabled";

        List<String> roleNames = user.getRoles() != null ? user.getRoles().stream()
                .map(Role::getName)
                .collect(Collectors.toList()) : List.of();

        return UserResponseDto.builder()
                .id(user.getId())
                .username(user.getUsername())
                .email(user.getProfile() != null ? user.getProfile().getEmail() : null)
                .phoneNumber(user.getProfile() != null ? user.getProfile().getPhoneNumber() : null)
                .status(statusString)
                .roles(roleNames)
                .build();
    }
}
