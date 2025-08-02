package com.ants.ktc.ants_ktc.services.address;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;

import com.ants.ktc.ants_ktc.dtos.address.ProvinceResponseDto;
import com.ants.ktc.ants_ktc.entities.address.Province;
import com.ants.ktc.ants_ktc.repositories.address.ProvinceJpaRepository;

@Service
public class ProvinceService {
    private final ProvinceJpaRepository provinceRepository;

    public ProvinceService(ProvinceJpaRepository provinceRepository) {
        this.provinceRepository = provinceRepository;
    }

    public List<ProvinceResponseDto> getAllProvinces() {
        List<Province> provinces = provinceRepository.findAll();
        return provinces.stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    private ProvinceResponseDto convertToDto(Province province) {
        return ProvinceResponseDto.builder()
                .id(province.getId())
                .name(province.getName())
                // Không map districts ở đây!
                .build();
    }
}
