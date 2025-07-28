package com.ants.ktc.ants_ktc.controllers.address;

import java.util.List;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.ants.ktc.ants_ktc.dtos.address.WardResponseDto;
import com.ants.ktc.ants_ktc.services.address.WardService;

@RestController
@RequestMapping("/api/wards")
public class WardController {

    private final WardService wardService;

    public WardController(WardService wardService) {
        this.wardService = wardService;
    }

    @GetMapping("/{districtId}")
    public List<WardResponseDto> getWardsByDistrictId(@PathVariable("districtId") Long districtId) {
        return wardService.getWardsByDistrictId(districtId);
    }

}
