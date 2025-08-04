package com.ants.ktc.ants_ktc.repositories;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.ants.ktc.ants_ktc.entities.Transaction;

@Repository
public interface TransactionsJpaRepository extends JpaRepository<Transaction, UUID> {

    // Lấy transaction kèm wallet bằng EntityGraph
    @EntityGraph(attributePaths = { "wallet" })
    Optional<Transaction> findWithWalletById(UUID id);

    @EntityGraph(attributePaths = { "wallet" })
    @Query("SELECT t FROM Transaction t WHERE t.wallet.user.id = :userId")
    List<Transaction> findAllTransactionsByUserIdWithWallet(@Param("userId") UUID userId);

    @Query("SELECT t FROM Transaction t WHERE t.wallet.user.id = :userId")
    Page<Transaction> findAllByUserId(@Param("userId") UUID userId, Pageable pageable);
}
