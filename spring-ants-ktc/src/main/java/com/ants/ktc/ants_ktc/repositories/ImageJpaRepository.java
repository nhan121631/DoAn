package com.ants.ktc.ants_ktc.repositories;

import java.util.List;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.ants.ktc.ants_ktc.entities.Image;

@Repository
public interface ImageJpaRepository extends JpaRepository<Image, Long> {

    @Query("SELECT i FROM Image i WHERE i.room.id = :id")
    List<Image> findByRoomId(@Param("id") UUID id);

    @Query("SELECT i FROM Image i WHERE i.room.id IN :roomIds")
    List<Image> findByRoomIdIn(@Param("roomIds") List<UUID> roomIds);

    // Additional query methods can be defined here if needed

    long countByUrl(String url);

}
