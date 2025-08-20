package com.ants.ktc.ants_ktc.repositories.address;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.ants.ktc.ants_ktc.entities.address.Ward;

@Repository
public interface WardJpaRepository extends JpaRepository<Ward, Long> {

    List<Ward> findByDistrictId(Long districtId);

    @EntityGraph(attributePaths = { "district", "district.province" })
    Optional<Ward> findById(Long id);

    // Thêm methods để tìm ward đầu tiên theo district và province
    Ward findFirstByDistrictId(Long districtId);

    Ward findFirstByDistrictProvinceId(Long provinceId);

}