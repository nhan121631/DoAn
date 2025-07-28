package com.ants.ktc.ants_ktc.controllers.address;

import java.util.List;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.ants.ktc.ants_ktc.dtos.address.DistrictResponseDto;
import com.ants.ktc.ants_ktc.services.address.DistrictService;

@RestController
@RequestMapping("/api/districts")

public class DistrictController {
    private final DistrictService districtService;

    public DistrictController(DistrictService districtService) {
        this.districtService = districtService;
    }

    @GetMapping("/{provinceId}")
    public List<DistrictResponseDto> getDistrictsByProvinceId(@PathVariable("provinceId") Long provinceId) {
        return districtService.getDistrictsByProvinceId(provinceId);
    }
}