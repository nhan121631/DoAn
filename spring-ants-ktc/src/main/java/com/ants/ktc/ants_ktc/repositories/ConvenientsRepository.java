package com.ants.ktc.ants_ktc.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.ants.ktc.ants_ktc.entities.convenient.Convenients;

@Repository
public interface ConvenientsRepository extends JpaRepository<Convenients, Long> {
    
}
