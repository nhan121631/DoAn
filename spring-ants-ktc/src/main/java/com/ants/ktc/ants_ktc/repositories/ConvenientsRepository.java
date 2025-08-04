package com.ants.ktc.ants_ktc.repositories;

import java.util.List;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.ants.ktc.ants_ktc.entities.Convenient;


@Repository
public interface ConvenientsRepository extends JpaRepository<Convenient, Long> {

    List<Convenient> findByRoomId(UUID roomId);

    List<Convenient> findAllById(List<UUID> convenientIds);
    
}
