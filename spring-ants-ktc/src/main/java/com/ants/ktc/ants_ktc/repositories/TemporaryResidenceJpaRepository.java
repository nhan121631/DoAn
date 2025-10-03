package com.ants.ktc.ants_ktc.repositories;

import com.ants.ktc.ants_ktc.entities.TemporaryResidence;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
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

        @Query("select c.landlord.id from Contract c where c.id = :contractID")
        UUID findLandlordByTemporaryResidenceId(@Param("contractID") UUID contractID);

        @Query("SELECT t.room.id FROM Contract t WHERE t.id = :contractID")
        UUID findRoomIdByTemporaryResidenceId(@Param("contractID") UUID contractID);

        @Query("SELECT t FROM TemporaryResidence t " +
                "JOIN t.contract c " +
                "WHERE c.landlord.id = :landlordId")
        List<TemporaryResidence> findByLandlordId(@Param("landlordId") UUID landlordId);

}