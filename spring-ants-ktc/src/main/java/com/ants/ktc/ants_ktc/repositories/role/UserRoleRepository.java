package com.ants.ktc.ants_ktc.repositories.role;

import java.util.List;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

import com.ants.ktc.ants_ktc.entities.Role;

public interface UserRoleRepository extends JpaRepository<Role, UUID> {
    List<Role> findByUserId(UUID userId);

}