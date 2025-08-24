package com.ants.ktc.ants_ktc.repositories;

import com.ants.ktc.ants_ktc.entities.Rating;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface RatingJpaRepository extends JpaRepository<Rating, UUID> {
    @Query("SELECT r FROM Rating r " +
            "JOIN FETCH r.user u " +
            "JOIN FETCH r.room ro " +
            "WHERE ro.id = :roomId")
    List<Rating> findAllByRoomIdWithUserAndRoom(@Param("roomId") UUID roomId);

    @Query("SELECT r FROM Rating r " +
            "JOIN FETCH r.room ro " +
            "JOIN FETCH ro.user l " +
            "WHERE l.id = :landlordId")
    List<Rating> findAllByLandlordId(@Param("landlordId") UUID landlordId);

    // Kiểm tra user đã đánh giá phòng này chưa
    boolean existsByUserIdAndRoomId(UUID userId, UUID roomId);
}
