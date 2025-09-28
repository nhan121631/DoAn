package com.ants.ktc.ants_ktc.repositories;

import com.ants.ktc.ants_ktc.entities.Contract;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface ContractJpaRepository extends JpaRepository<Contract, UUID> {

        @Query("SELECT c FROM Contract c " +
                        "JOIN FETCH c.room r " +
                        "JOIN FETCH r.address a " +
                        "JOIN FETCH a.ward w " +
                        "JOIN FETCH w.district d " +
                        "JOIN FETCH d.province p " +
                        "JOIN FETCH c.landlord l " +
                        "JOIN FETCH l.profile lp " +
                        "WHERE c.tenant.id = :tenantId")
        List<Contract> findByTenantIdWithDetails(@Param("tenantId") UUID tenantId);

        @Query("SELECT c FROM Contract c " +
                        "JOIN FETCH c.room r " +
                        "JOIN FETCH r.address a " +
                        "JOIN FETCH a.ward w " +
                        "JOIN FETCH w.district d " +
                        "JOIN FETCH d.province p " +
                        "JOIN FETCH c.tenant t " +
                        "JOIN FETCH t.profile tp " +
                        "JOIN FETCH c.landlord l " +
                        "JOIN FETCH l.profile lp " +
                        "WHERE c.id = :contractId")
        Contract findByIdWithDetails(@Param("contractId") UUID contractId);

        @Query("SELECT c FROM Contract c " +
                        "JOIN FETCH c.room r " +
                        "JOIN FETCH r.address a " +
                        "JOIN FETCH a.ward w " +
                        "JOIN FETCH w.district d " +
                        "JOIN FETCH d.province p " +
                        "JOIN FETCH c.tenant t " +
                        "JOIN FETCH t.profile tp " +
                        "LEFT JOIN FETCH c.bills " +
                        "WHERE c.landlord.id = :landlordId")
        Page<Contract> findByLandlordId(@Param("landlordId") UUID landlordId, Pageable pageable);

        List<Contract> findByRoomId(UUID roomId);

        // lấy hợp đồng đang active
        List<Contract> findByStatus(int status);

}
