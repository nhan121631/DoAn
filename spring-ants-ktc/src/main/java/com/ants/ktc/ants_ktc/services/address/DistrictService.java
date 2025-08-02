package com.ants.ktc.ants_ktc.services.address;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;

import com.ants.ktc.ants_ktc.dtos.address.DistrictResponseDto;
import com.ants.ktc.ants_ktc.entities.address.District;
import com.ants.ktc.ants_ktc.repositories.address.DistrictJpaRepository;

@Service
public class DistrictService {
    private final DistrictJpaRepository districtRepository;

    public DistrictService(DistrictJpaRepository districtRepository) {
        this.districtRepository = districtRepository;
    }

    public DistrictResponseDto convertToDto(District district) {
        return DistrictResponseDto.builder()
                .id(district.getId())
                .name(district.getName())
                // Không map wards ở đây!
                .build();
    }

    public List<DistrictResponseDto> getDistrictsByProvinceId(Long provinceId) {
        List<District> districts = districtRepository.findByProvinceId(provinceId);

        if (districts.isEmpty()) {
            throw new RuntimeException("No districts found for province ID: " + provinceId);
        }

        return districts.stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }
}
