package com.ants.ktc.ants_ktc.repositories;

import com.ants.ktc.ants_ktc.entities.Bill;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface BillJpaRepository extends JpaRepository<Bill, UUID> {

    @Query("SELECT b FROM Bill b WHERE b.contract.id = :contractId")
    List<Bill> findByContractId(@Param("contractId") UUID contractId);

    @Query("SELECT b FROM Bill b WHERE b.contract.id = :contractId AND b.status = 'PENDING'")
    List<Bill> findUnpaidBillsByContractId(@Param("contractId") UUID contractId);

    @Query("SELECT b FROM Bill b WHERE b.contract.id = :contractId AND b.month = :month")
    Bill findByContractIdAndMonth(@Param("contractId") UUID contractId, @Param("month") String month);

    @Query("SELECT b FROM Bill b " +
            "JOIN b.contract c " +
            "WHERE c.tenant.id = :tenantId")
    List<Bill> findByTenantId(@Param("tenantId") UUID tenantId);

}
