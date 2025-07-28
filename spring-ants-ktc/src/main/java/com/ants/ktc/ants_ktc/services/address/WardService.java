package com.ants.ktc.ants_ktc.services.address;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;

import com.ants.ktc.ants_ktc.dtos.address.WardResponseDto;
import com.ants.ktc.ants_ktc.repositories.address.WardRepository;

@Service
public class WardService {
    private final WardRepository wardRepository;

    public WardService(WardRepository wardRepository) {
        this.wardRepository = wardRepository;
    }

    public List<WardResponseDto> getWardsByDistrictId(Long districtId) {
        return wardRepository.findByDistrictId(districtId)
                .stream()
                .map(ward -> new WardResponseDto(ward.getId(), ward.getName()))
                .collect(Collectors.toList());
    }
}
