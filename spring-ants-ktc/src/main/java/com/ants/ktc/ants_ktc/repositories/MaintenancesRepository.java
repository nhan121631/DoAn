package com.ants.ktc.ants_ktc.repositories;

import com.ants.ktc.ants_ktc.entities.Maintenances;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface MaintenancesRepository extends JpaRepository<Maintenances, UUID> {

        List<MaintenanceProjection> findByRoom_UserIdAndIsRemovedFalse(UUID userId);

        List<MaintenanceProjection> findByRoom_UserIdAndStatusAndRoom_IdAndIsRemovedFalse(UUID userId, Integer status,
                        UUID roomId);

        List<MaintenanceProjection> findByRoom_UserIdAndStatusAndIsRemovedFalse(UUID userId, Integer status);

        List<MaintenanceProjection> findByRoom_UserIdAndRoom_IdAndIsRemovedFalse(UUID userId, UUID roomId);

        Optional<Maintenances> findByIdAndRoom_UserIdAndIsRemovedFalse(UUID id, UUID userId);

        Optional<Maintenances> findByIdAndRoom_UserId(UUID id, UUID userId);

        Page<MaintenanceProjection> findByRoom_UserIdAndIsRemovedFalse(UUID userId, Pageable pageable);

        Page<MaintenanceProjection> findByRoom_UserIdAndStatusAndRoom_IdAndIsRemovedFalse(UUID userId, Integer status,
                        UUID roomId, Pageable pageable);

        Page<MaintenanceProjection> findByRoom_UserIdAndStatusAndIsRemovedFalse(UUID userId, Integer status,
                        Pageable pageable);

        Page<MaintenanceProjection> findByRoom_UserIdAndRoom_IdAndIsRemovedFalse(UUID userId, UUID roomId,
                        Pageable pageable);

}
