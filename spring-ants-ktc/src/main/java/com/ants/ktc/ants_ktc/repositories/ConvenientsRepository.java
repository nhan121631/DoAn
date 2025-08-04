package com.ants.ktc.ants_ktc.repositories;

import java.util.List;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.ants.ktc.ants_ktc.entities.Convenient;


@Repository
public interface ConvenientsRepository extends JpaRepository<Convenient, Long> {
    @Query("SELECT c FROM Convenient c JOIN c.rooms r WHERE r.id = :roomId")
    List<Convenient> findByRoomId(@Param("roomId") UUID roomId);
}

