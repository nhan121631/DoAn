package com.ants.ktc.ants_ktc.repositories.address;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.ants.ktc.ants_ktc.entities.address.Ward;

@Repository
public interface WardRepository extends JpaRepository<Ward, Long> {

    public List<Ward> findByDistrictId(Long districtId);

}