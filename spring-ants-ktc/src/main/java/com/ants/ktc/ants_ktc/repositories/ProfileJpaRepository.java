package com.ants.ktc.ants_ktc.repositories;

import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.ants.ktc.ants_ktc.entities.UserProfile;

@Repository
public interface ProfileJpaRepository extends JpaRepository<UserProfile, UUID> {
        boolean existsByEmailAndIdNot(String email, UUID id);

        boolean existsByPhoneNumberAndIdNot(String phoneNumber, UUID id);

        @EntityGraph(attributePaths = {
                        "user", "user.roles", "address", "address.ward", "address.ward.district",
                        "address.ward.district.province"
        })
        Optional<UserProfile> findById(UUID id);
        // Define custom query methods if needed

        boolean existsByEmail(String email);

        @EntityGraph(attributePaths = {
                        "user", "user.roles", "address", "address.ward", "address.ward.district",
                        "address.ward.district.province"
        })
        Optional<UserProfile> findByEmail(String email);
}
