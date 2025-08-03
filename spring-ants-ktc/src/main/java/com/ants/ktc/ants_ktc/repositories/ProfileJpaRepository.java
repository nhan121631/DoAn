package com.ants.ktc.ants_ktc.repositories;

import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

import com.ants.ktc.ants_ktc.entities.UserProfile;

public interface ProfileJpaRepository extends JpaRepository<UserProfile, UUID> {
    boolean existsByEmailAndIdNot(String email, UUID id);

    boolean existsByPhoneNumberAndIdNot(String phoneNumber, UUID id);
    // Define custom query methods if needed
}
