package com.ants.ktc.ants_ktc.repositories.address;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.ants.ktc.ants_ktc.entities.address.District;

@Repository
public interface DistrictJpaRepository extends JpaRepository<District, Long> {

    public List<District> findByProvinceId(Long provinceId);

}
