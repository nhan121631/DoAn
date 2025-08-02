package com.ants.ktc.ants_ktc.repositories.address;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.ants.ktc.ants_ktc.entities.address.Province;

@Repository
public interface ProvinceJpaRepository extends JpaRepository<Province, Long> {
    
    // Additional query methods can be defined here if needed

    
}
