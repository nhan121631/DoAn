package com.ants.ktc.ants_ktc.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.ants.ktc.ants_ktc.entities.Image;

@Repository
public interface ImageJpaRepository extends JpaRepository<Image, Long> {
    // Additional query methods can be defined here if needed

    
}
