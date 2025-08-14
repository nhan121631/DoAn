
package com.ants.ktc.ants_ktc.repositories;

import com.ants.ktc.ants_ktc.entities.Maintenances;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface MaintenancesRepository extends JpaRepository<Maintenances, UUID> {

        @Query("""
                            SELECT m FROM Maintenances m
                            LEFT JOIN FETCH m.room r
                            WHERE m.isRemoved = false
                            AND r.user.id = :userId
                            AND (:status IS NULL OR m.status = :status)
                            AND (:roomId IS NULL OR r.id = :roomId)
                        """)
        Page<Maintenances> findMaintenanceRequestsByCriteria(
                        @Param("userId") UUID userId,
                        @Param("status") Integer status,
                        @Param("roomId") UUID roomId,
                        Pageable pageable);

        @Query("""
                            SELECT m FROM Maintenances m
                            LEFT JOIN FETCH m.room r
                            WHERE m.id = :id
                            AND r.user.id = :userId
                            AND m.isRemoved = false
                        """)
        Optional<Maintenances> findActiveByIdAndUserId(
                        @Param("id") UUID id,
                        @Param("userId") UUID userId);
}