package com.ants.ktc.ants_ktc.services;

import com.ants.ktc.ants_ktc.dtos.manage_account.UserAccountProjection;

// import java.util.ArrayList;
// import java.util.List;
// import java.util.UUID;
// import java.util.stream.Collectors;

// import org.springframework.stereotype.Service;
// import org.springframework.transaction.annotation.Transactional;

// import com.ants.ktc.ants_ktc.dtos.manage_account.UserResponseDto;
// import com.ants.ktc.ants_ktc.entities.Role;
// import com.ants.ktc.ants_ktc.entities.User;
// import com.ants.ktc.ants_ktc.repositories.RoleJpaRepository;
// import com.ants.ktc.ants_ktc.repositories.UserJpaRepository;

// @Service
// public class AccountManagementService {

// private final UserJpaRepository userJpaRepository;
// private final RoleJpaRepository roleJpaRepository;

// public AccountManagementService(UserJpaRepository userJpaRepository,
// RoleJpaRepository roleJpaRepository) {
// this.userJpaRepository = userJpaRepository;
// this.roleJpaRepository = roleJpaRepository;

// }

// @Transactional(readOnly = true)
// public List<UserResponseDto> getAllUsers() {

// List<User> users = userJpaRepository.findAllExcludingAdmins();

// return users.stream()
// .map(this::convertToUserResponseDto)
// .collect(Collectors.toList());
// }

// @Transactional(readOnly = true)
// public UserResponseDto getUserById(UUID userId) {

// return userJpaRepository.findById(userId)
// .map(this::convertToUserResponseDto)
// .orElseThrow(() -> new IllegalArgumentException(
// "User with ID " + userId + " not found"));

// }

// @Transactional
// public UserResponseDto updateUserStatus(UUID userId, int newStatus) {
// User user = userJpaRepository.findById(userId)
// .orElseThrow(() -> new IllegalArgumentException(
// "User with ID " + userId + " not found."));

// if (newStatus != 0 && newStatus != 1) {
// throw new IllegalArgumentException(
// "Invalid status value. Must be 0 (Active) or 1 (Disabled).");
// }

// user.setIsActive(newStatus);
// User updatedUser = userJpaRepository.save(user);

// return convertToUserResponseDto(updatedUser);
// }

// @Transactional
// public UserResponseDto updateUserRoles(UUID userId, List<String> roleNames) {
// User user = userJpaRepository.findById(userId)
// .orElseThrow(() -> new IllegalArgumentException(
// "User with ID " + userId + " not found."));

// List<Role> newRoles = new ArrayList<>();
// for (String roleName : roleNames) {
// Role role = roleJpaRepository.findByName(roleName)
// .orElseThrow(() -> new IllegalArgumentException(
// "Role not found with name: " + roleName));
// newRoles.add(role);
// }

// user.setRoles(newRoles);
// User updatedUser = userJpaRepository.save(user);

// return convertToUserResponseDto(updatedUser);
// }

// private UserResponseDto convertToUserResponseDto(User user) {

// String statusString = (user.getIsActive() == 0) ? "Active" : "Disabled";

// List<String> roleNames = user.getRoles() != null ? user.getRoles().stream()
// .map(Role::getName)
// .collect(Collectors.toList()) : List.of();

// return UserResponseDto.builder()

// .id(user.getId())

// .username(user.getUsername())

// .email(user.getProfile() != null ? user.getProfile().getEmail() : null)
// .phoneNumber(user.getProfile() != null ? user.getProfile().getPhoneNumber() :
// null)
// .status(statusString)
// .roles(roleNames)
// .build();
// }
// }

// --------------------------------------------///
// import com.ants.ktc.ants_ktc.dtos.manage_account.UserResponseDto;
// import com.ants.ktc.ants_ktc.entities.Role;
// import com.ants.ktc.ants_ktc.entities.User;
// import com.ants.ktc.ants_ktc.repositories.RoleJpaRepository;
// import com.ants.ktc.ants_ktc.repositories.UserJpaRepository;
// import lombok.RequiredArgsConstructor;
// import org.springframework.stereotype.Service;
// import org.springframework.transaction.annotation.Transactional;

// import java.util.ArrayList;
// import java.util.List;
// import java.util.Map;
// import java.util.UUID;
// import java.util.stream.Collectors;

// @Service
// @RequiredArgsConstructor
// public class AccountManagementService {

// private final UserJpaRepository userJpaRepository;
// private final RoleJpaRepository roleJpaRepository;

// /**
// * Lấy danh sách tất cả các tài khoản người dùng, loại trừ Administrators.
// * Sử dụng các truy vấn tối ưu để tránh lỗi N+1.
// *
// * @return List chứa các UserResponseDto.
// */
// @Transactional(readOnly = true)
// public List<UserResponseDto> getAllUsers() {
// List<UserAccountProjection> projections =
// userJpaRepository.findAllUserProjectionsExcludingAdmins();

// List<UUID> userIds = projections.stream()
// .map(UserAccountProjection::getId)
// .collect(Collectors.toList());

// Map<UUID, List<String>> rolesMap =
// userJpaRepository.findRoleNamesByUserIds(userIds).stream()
// .collect(Collectors.groupingBy(
// data -> (UUID) data[0],
// Collectors.mapping(data -> (String) data[1], Collectors.toList())));

// return projections.stream()
// .map(projection -> {
// UserResponseDto dto = new UserResponseDto();
// dto.setId(projection.getId());
// dto.setUsername(projection.getUsername());
// dto.setStatus(projection.getIsActive() == 0 ? "Active" : "Disabled");
// dto.setEmail(projection.getEmail());
// dto.setPhoneNumber(projection.getPhoneNumber());
// dto.setRoles(rolesMap.getOrDefault(projection.getId(), new ArrayList<>()));
// return dto;
// })
// .collect(Collectors.toList());
// }

// /**
// * Lấy thông tin chi tiết một tài khoản bằng ID.
// *
// * @param userId ID của tài khoản.
// * @return UserResponseDto chứa thông tin chi tiết.
// */
// @Transactional(readOnly = true)
// public UserResponseDto getUserById(UUID userId) {
// UserAccountProjection projection =
// userJpaRepository.findAccountProjectionById(userId)
// .orElseThrow(() -> new IllegalArgumentException("User with ID " + userId + "
// not found."));

// List<String> roleNames =
// userJpaRepository.findRoleNamesByUserIds(List.of(userId)).stream()
// .map(data -> (String) data[1])
// .collect(Collectors.toList());

// UserResponseDto dto = new UserResponseDto();
// dto.setId(projection.getId());
// dto.setUsername(projection.getUsername());
// dto.setStatus(projection.getIsActive() == 0 ? "Active" : "Disabled");
// dto.setEmail(projection.getEmail());
// dto.setPhoneNumber(projection.getPhoneNumber());
// dto.setRoles(roleNames);

// return dto;
// }

// /**
// * Cập nhật trạng thái của người dùng.
// *
// * @param userId ID của người dùng.
// * @param newStatus Trạng thái mới (0: Active, 1: Disabled).
// * @return DTO của người dùng sau khi cập nhật.
// */
// @Transactional
// public UserResponseDto updateUserStatus(UUID userId, int newStatus) {
// User user = userJpaRepository.findById(userId)
// .orElseThrow(() -> new IllegalArgumentException("User with ID " + userId + "
// not found."));

// user.setIsActive(newStatus);
// User updatedUser = userJpaRepository.save(user);

// return convertToUserResponseDto(updatedUser);
// }

// /**
// * Cập nhật vai trò (roles) của người dùng.
// *
// * @param userId ID của người dùng.
// * @param roleNames Danh sách tên vai trò mới.
// * @return DTO của người dùng sau khi cập nhật.
// */
// @Transactional
// public UserResponseDto updateUserRoles(UUID userId, List<String> roleNames) {
// if (roleNames == null || roleNames.isEmpty()) {
// throw new IllegalArgumentException("Roles cannot be null or empty");
// }
// User user = userJpaRepository.findById(userId)
// .orElseThrow(() -> new IllegalArgumentException("User with ID " + userId + "
// not found."));

// List<Role> newRoles = new ArrayList<>();
// for (String roleName : roleNames) {
// Role role = roleJpaRepository.findByName(roleName)
// .orElseThrow(() -> new IllegalArgumentException("Role not found with name: "
// + roleName));
// newRoles.add(role);
// }
// user.setRoles(newRoles);
// User updatedUser = userJpaRepository.save(user);
// return convertToUserResponseDto(updatedUser);
// }

// // Helper method để chuyển đổi Entity sang DTO
// private UserResponseDto convertToUserResponseDto(User user) {
// String statusString = (user.getIsActive() == 0) ? "Active" : "Disabled";
// List<String> roleNames = user.getRoles() != null ? user.getRoles().stream()
// .map(Role::getName)
// .collect(Collectors.toList()) : List.of();

// return UserResponseDto.builder()

// .id(user.getId())

// .username(user.getUsername())
// .email(user.getProfile() != null ? user.getProfile().getEmail() : null)
// .phoneNumber(user.getProfile() != null ? user.getProfile().getPhoneNumber() :
// null)
// .status(statusString)
// .roles(roleNames)
// .build();
// }
// }
// -----------------------------------------------//

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

    // --- Thêm phương thức mới để xử lý phân trang ---
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
