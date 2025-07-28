package com.ants.ktc.ants_ktc.repositories.address;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.ants.ktc.ants_ktc.entities.address.Ward;

@Repository
public interface WardRepository extends JpaRepository<Ward, Long> {

    // Additional query methods can be defined here if needed

}