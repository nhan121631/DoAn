package com.ants.ktc.ants_ktc.services.address;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;

import com.ants.ktc.ants_ktc.dtos.address.WardResponseDto;
import com.ants.ktc.ants_ktc.repositories.address.WardJpaRepository;

@Service
public class WardService {
    private final WardJpaRepository wardRepository;

    public WardService(WardJpaRepository wardRepository) {
        this.wardRepository = wardRepository;
    }

    public List<WardResponseDto> getWardsByDistrictId(Long districtId) {
        return wardRepository.findByDistrictId(districtId)
                .stream()
                .map(ward -> WardResponseDto.builder()
                        .id(ward.getId())
                        .name(ward.getName())
                        // .district(districtDto) // nếu cần
                        .build())
                .collect(Collectors.toList());
    }
}
