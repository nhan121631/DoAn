package com.ants.ktc.ants_ktc.repositories;

import com.ants.ktc.ants_ktc.entities.Role;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface RoleJpaRepository extends JpaRepository<Role, UUID> {
    Optional<Role> findByName(String name);
}