package com.ants.ktc.ants_ktc.repositories.role;

import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.ants.ktc.ants_ktc.entities.role.Roles;

@Repository
public interface RoleRepository extends JpaRepository<Roles, UUID> {
    Optional<Roles> findByCode(String code);
}