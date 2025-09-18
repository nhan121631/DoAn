package com.ants.ktc.ants_ktc.repositories;

import java.util.UUID;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.ants.ktc.ants_ktc.entities.Requirement;
import com.ants.ktc.ants_ktc.repositories.projection.RequirementLandLordProjection;
import com.ants.ktc.ants_ktc.repositories.projection.RequirementUserProjection;

import jakarta.transaction.Transactional;

@Repository
public interface RequirementJpaRepository extends JpaRepository<Requirement, UUID> {

       @Query("""
                         SELECT r.id AS id,
                                ro.title AS roomTitle,
                                r.user.id as userId,
                                ro.id as roomId,
                                r.user.profile.fullName AS userName,
                                r.user.profile.email AS email,
                                r.description AS description,
                       r.status AS status,
                       r.imageUrl AS imageUrl,
                       r.createdDate AS createdDate
                         FROM Requirement r
                         JOIN r.room ro
                         WHERE ro.user.id = :userId
                     """)
       Page<RequirementLandLordProjection> findRequirmentsByLandlordId(
                     @Param("userId") UUID userId, Pageable pageable);

       @Query("""
                         SELECT r.id AS id,
                                ro.title AS roomTitle,
                                 r.user.id as userId,
                                   ro.id as roomId,
                                ro.user.profile.fullName AS userName,
                                ro.user.profile.email AS email,
                                r.description AS description,
                       r.status AS status,
                       r.imageUrl AS imageUrl,
                       r.createdDate AS createdDate
                         FROM Requirement r
                         JOIN r.room ro
                         WHERE r.user.id = :userId
                     """)
       Page<RequirementUserProjection> findRequirmentsByUserId(
                     @Param("userId") UUID userId, Pageable pageable);

       @Modifying
       @Transactional
       @Query("""
                     UPDATE Requirement r
                     SET r.status = 1
                     WHERE r.id = :id
                     """)
       int updateRequirementStatus(@Param("id") UUID id);

       @Modifying
       @Transactional
       @Query("""
                     UPDATE Requirement r
                     SET r.status = 2
                     WHERE r.id = :id
                     """)
       int rejectRequirements(@Param("id") UUID id);
}
