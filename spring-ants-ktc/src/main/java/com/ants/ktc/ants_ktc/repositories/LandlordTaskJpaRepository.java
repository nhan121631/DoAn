package com.ants.ktc.ants_ktc.repositories;

import com.ants.ktc.ants_ktc.entities.LandlordTask;

import jakarta.transaction.Transactional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface LandlordTaskJpaRepository extends JpaRepository<LandlordTask, UUID> {

        @Query("SELECT t FROM LandlordTask t " +
                        "JOIN FETCH t.landlord l " +
                        "JOIN FETCH l.profile lp " +
                        "LEFT JOIN FETCH t.room r " +
                        "WHERE l.id = :landlordId")
        Page<LandlordTask> findByLandlordId(@Param("landlordId") UUID landlordId, Pageable pageable);

        @Query("SELECT t FROM LandlordTask t " +
                        "JOIN FETCH t.landlord l " +
                        "JOIN FETCH l.profile lp " +
                        "LEFT JOIN FETCH t.room r " +
                        "WHERE t.id = :taskId")
        LandlordTask findByIdWithDetails(@Param("taskId") UUID taskId);

        @Modifying
        @Transactional
        @Query("UPDATE LandlordTask t SET t.status = :status WHERE t.relatedEntityId = :relatedEntityId")
        int updateTaskStatus(@Param("relatedEntityId") UUID relatedEntityId, @Param("status") String status);

        List<LandlordTask> findByRoomId(UUID roomId);

        List<LandlordTask> findByStatus(String status);

        List<LandlordTask> findByPriority(String priority);

        List<LandlordTask> findByLandlordId(UUID landlordId);
}