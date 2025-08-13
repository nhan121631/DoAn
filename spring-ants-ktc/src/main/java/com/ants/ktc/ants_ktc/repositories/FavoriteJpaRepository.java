package com.ants.ktc.ants_ktc.repositories;

import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

import com.ants.ktc.ants_ktc.entities.Favorite;

public interface FavoriteJpaRepository extends JpaRepository<Favorite, UUID> {

    boolean existsByUserIdAndRoomId(UUID userId, UUID roomId);

}
