package com.ants.ktc.ants_ktc.repositories;

import com.ants.ktc.ants_ktc.entities.Maintenances;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.UUID;

@Repository
public interface MaintenancesRepository extends JpaRepository<Maintenances, UUID> {

    @Query("SELECT m FROM Maintenances m " +
            "JOIN FETCH m.room r " +
            "LEFT JOIN FETCH r.address ra " +
            "LEFT JOIN FETCH ra.ward waw " +
            "LEFT JOIN FETCH waw.district wad " +
            "LEFT JOIN FETCH wad.province wap " +
            "WHERE r.user.id = :userId")
    List<Maintenances> findAllByLandlordIdWithRoom(@Param("userId") UUID userId);

    @Query("SELECT m FROM Maintenances m JOIN FETCH m.room r WHERE r.id = :roomId")
    List<Maintenances> findAllByRoomIdWithRoom(@Param("roomId") UUID roomId);
}
