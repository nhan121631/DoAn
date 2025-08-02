package com.ants.ktc.ants_ktc.repositories;

import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.ants.ktc.ants_ktc.entities.Wallet;

@Repository
public interface WalletJpaRepository extends JpaRepository<Wallet, UUID> {

    // Lấy wallet kèm user bằng EntityGraph
    @EntityGraph(attributePaths = { "user" })
    Optional<Wallet> findWithUserById(UUID id);

    // Tìm wallet theo userId kèm user
    @EntityGraph(attributePaths = { "user" })
    Optional<Wallet> findByUserId(UUID userId);
}
