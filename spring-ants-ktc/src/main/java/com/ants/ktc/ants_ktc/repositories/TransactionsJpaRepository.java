package com.ants.ktc.ants_ktc.repositories;

import java.math.BigDecimal;
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

        @Query("SELECT t FROM Transaction t WHERE t.wallet.user.id = :userId ORDER BY t.transactionDate DESC")
        Page<Transaction> findAllByUserId(@Param("userId") UUID userId, Pageable pageable);

        @Query("SELECT t FROM Transaction t WHERE t.wallet = :wallet AND t.transactionType = :type ORDER BY t.transactionDate DESC LIMIT 1")
        Transaction findLatestTransactionByWalletAndType(@Param("wallet") Wallet wallet, @Param("type") int type);

        // Find transaction by wallet, type, and description containing room title for
        // better accuracy in refunds
        @Query("SELECT t FROM Transaction t WHERE t.wallet = :wallet AND t.transactionType = :type AND t.description LIKE %:roomTitle% ORDER BY t.transactionDate DESC LIMIT 1")
        Transaction findLatestTransactionByWalletTypeAndDescription(@Param("wallet") Wallet wallet,
                        @Param("type") int type, @Param("roomTitle") String roomTitle);

        // Find transaction by wallet, type, description containing room title, and
        // amount for specific room operations (approve/reject)
        @Query("SELECT t FROM Transaction t WHERE t.wallet = :wallet AND t.transactionType = :type AND t.description LIKE %:roomTitle% AND t.amount = :amount ORDER BY t.transactionDate DESC LIMIT 1")
        Transaction findLatestTransactionByWalletTypeDescriptionAndAmount(@Param("wallet") Wallet wallet,
                        @Param("type") int type, @Param("roomTitle") String roomTitle, @Param("amount") Double amount);

        @Query("SELECT t FROM Transaction t WHERE t.wallet.user.id = :userId AND t.transactionDate >= :startDate AND t.transactionDate <= :endDate")
        Page<Transaction> findAllByUserIdAndDateRange(@Param("userId") UUID userId,
                        @Param("startDate") Date startDate, @Param("endDate") Date endDate, Pageable pageable);

        boolean existsByTransactionCode(String transactionCode);

        // Statistics queries
        @Query("SELECT SUM(t.amount) FROM Transaction t WHERE t.transactionType = 1") // Assuming 1 is for revenue
                                                                                      // transactions
        BigDecimal sumTotalRevenue();

        @Query("SELECT SUM(t.amount) FROM Transaction t WHERE t.transactionType = 1 AND t.transactionDate BETWEEN :startDate AND :endDate")
        BigDecimal sumRevenueByPeriod(@Param("startDate") java.util.Date startDate,
                        @Param("endDate") java.util.Date endDate);

        // Query for monthly revenue statistics - returns month-year and total revenue
        // for each month
        @Query("SELECT FUNCTION('DATE_FORMAT', t.transactionDate, '%Y-%m') as month, SUM(t.amount) as revenue " +
                        "FROM Transaction t " +
                        "WHERE t.transactionType = 1 AND t.transactionDate >= :startDate " +
                        "GROUP BY FUNCTION('DATE_FORMAT', t.transactionDate, '%Y-%m') " +
                        "ORDER BY month DESC")
        List<Object[]> getMonthlyRevenueStatistics(@Param("startDate") java.util.Date startDate);

        // Query for monthly transaction statistics by type
        @Query("SELECT FUNCTION('DATE_FORMAT', t.transactionDate, '%Y-%m') as month, " +
                        "t.transactionType as type, " +
                        "SUM(t.amount) as totalAmount " +
                        "FROM Transaction t " +
                        "WHERE t.transactionDate >= :startDate " +
                        "GROUP BY FUNCTION('DATE_FORMAT', t.transactionDate, '%Y-%m'), t.transactionType " +
                        "ORDER BY month DESC, t.transactionType ASC")
        List<Object[]> getMonthlyTransactionStatisticsByType(@Param("startDate") java.util.Date startDate);

        // Query for monthly transaction statistics by type for specific landlord
        @Query("SELECT FUNCTION('DATE_FORMAT', t.transactionDate, '%Y-%m') as month, " +
                        "t.transactionType as type, " +
                        "SUM(t.amount) as totalAmount " +
                        "FROM Transaction t " +
                        "WHERE t.wallet.user.id = :landlordId AND t.transactionDate >= :startDate " +
                        "GROUP BY FUNCTION('DATE_FORMAT', t.transactionDate, '%Y-%m'), t.transactionType " +
                        "ORDER BY month DESC, t.transactionType ASC")
        List<Object[]> getMonthlyTransactionStatisticsByTypeForLandlord(@Param("landlordId") UUID landlordId,
                        @Param("startDate") java.util.Date startDate);

}
