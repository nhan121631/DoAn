package com.ants.ktc.ants_ktc.repositories;

import java.util.Date;
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
import com.ants.ktc.ants_ktc.entities.Wallet;

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

    @Query("SELECT t FROM Transaction t WHERE t.wallet = :wallet AND t.transactionType = :type ORDER BY t.transactionDate DESC LIMIT 1")
    Transaction findLatestTransactionByWalletAndType(@Param("wallet") Wallet wallet, @Param("type") int type);

    @Query("SELECT t FROM Transaction t WHERE t.wallet.user.id = :userId AND t.transactionDate >= :startDate AND t.transactionDate <= :endDate")
    Page<Transaction> findAllByUserIdAndDateRange(@Param("userId") UUID userId,
            @Param("startDate") Date startDate, @Param("endDate") Date endDate, Pageable pageable);
}
