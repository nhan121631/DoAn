package com.ants.ktc.ants_ktc.repositories;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import com.ants.ktc.ants_ktc.entities.PostType;

@Repository
public interface PostTypeJpaRepository extends JpaRepository<PostType, UUID> {

    Optional<PostType> findByCode(String code);

    @Query("SELECT p FROM PostType p WHERE p.isRemove = 0")
    List<TypePostProjection> findAllActive();

    // Optional<PostType> findById(UUID id);
}
