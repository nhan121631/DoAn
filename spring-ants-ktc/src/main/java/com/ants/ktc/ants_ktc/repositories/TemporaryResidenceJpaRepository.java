package com.ants.ktc.ants_ktc.repositories;


import com.ants.ktc.ants_ktc.entities.TemporaryResidence;
import io.lettuce.core.dynamic.annotation.Param;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface TemporaryResidenceJpaRepository extends JpaRepository<TemporaryResidence, UUID> {


    @Query("SELECT t FROM TemporaryResidence t WHERE t.contract.id = :contractId")
    List<TemporaryResidence> findByContractId(@Param("contractId") UUID contractId);


    @Query("SELECT t FROM TemporaryResidence t WHERE t.idNumber = :idNumber")
    TemporaryResidence findByIdNumber(@Param("idNumber") String idNumber);


    @Query("SELECT t FROM TemporaryResidence t WHERE t.contract.id = :contractId " +
            "AND (t.endDate IS NULL OR t.endDate >= CURRENT_DATE)")
    List<TemporaryResidence> findActiveByContractId(@Param("contractId") UUID contractId);


    @Query("SELECT t FROM TemporaryResidence t " +
            "JOIN t.contract c " +
            "WHERE c.tenant.id = :tenantId")
    List<TemporaryResidence> findByTenantId(@Param("tenantId") UUID tenantId);

}