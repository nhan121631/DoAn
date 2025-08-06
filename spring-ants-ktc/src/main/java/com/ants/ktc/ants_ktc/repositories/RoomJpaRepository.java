package com.ants.ktc.ants_ktc.repositories;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import com.ants.ktc.ants_ktc.entities.Room;

@Repository
public interface RoomJpaRepository extends JpaRepository<Room, UUID> {
    @EntityGraph(attributePaths = {"images", "convenients", "postType"})
    Optional<Room> findById(UUID id);

    @EntityGraph(attributePaths = {
            "user", "user.roles", "address", "address.ward", "address.ward.district", "address.ward.district.province"
    })
    Optional<Room> findDetailedById(UUID id);

    @Query("SELECT r FROM Room r WHERE r.user.id = :userId")
    List<Room> findAllByUser(UUID userId);

    @Query("SELECT r FROM Room r WHERE r.user.id = :userId")
    Page<Room> findAllByUser(UUID userId, Pageable pageable);
}
