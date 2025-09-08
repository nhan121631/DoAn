package com.ants.ktc.ants_ktc.repositories;

import java.util.List;
import java.util.UUID;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.ants.ktc.ants_ktc.entities.Favorite;
import com.ants.ktc.ants_ktc.entities.User;

@Repository
public interface FavoriteJpaRepository extends JpaRepository<Favorite, UUID> {
    boolean existsByUserIdAndRoomId(UUID userId, UUID roomId);

    void deleteByUserIdAndRoomId(UUID userId, UUID roomId);

    // @Query("SELECT f FROM Favorite f JOIN FETCH f.room WHERE f.user.id = :userId
    // ORDER BY f.createdDate DESC")
    // Page<Favorite> findByUserIdWithRoom(@Param("userId") UUID userId, Pageable
    // pageable);

    @Query("SELECT f FROM Favorite f " +
            "JOIN FETCH f.room r " +
            "JOIN FETCH r.postType pt " +
            "WHERE f.user.id = :userId " +
            "ORDER BY f.createdDate DESC")
    Page<Favorite> findByUserIdWithRoom(@Param("userId") UUID userId, Pageable pageable);

    @Query("SELECT DISTINCT f.user FROM Favorite f WHERE f.user.profile.email IS NOT NULL")
    List<User> findUsersWithFavorites();

    // tăng lượt yt
    @Query("SELECT COUNT(f) FROM Favorite f WHERE f.room.id = :roomId")
    long countByRoomId(@Param("roomId") UUID roomId);

}
