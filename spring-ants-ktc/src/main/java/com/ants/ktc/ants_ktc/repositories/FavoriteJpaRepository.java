package com.ants.ktc.ants_ktc.repositories;

import java.util.UUID;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.ants.ktc.ants_ktc.entities.Favorite;

@Repository
public interface FavoriteJpaRepository extends JpaRepository<Favorite, UUID> {
    boolean existsByUserIdAndRoomId(UUID userId, UUID roomId);

    void deleteByUserIdAndRoomId(UUID userId, UUID roomId);

    @Query("SELECT f FROM Favorite f JOIN FETCH f.room WHERE f.user.id = :userId")
    Page<Favorite> findByUserIdWithRoom(@Param("userId") UUID userId, Pageable pageable);

}
