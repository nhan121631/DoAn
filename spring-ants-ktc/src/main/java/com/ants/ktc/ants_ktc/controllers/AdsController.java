package com.ants.ktc.ants_ktc.controllers;

import com.ants.ktc.ants_ktc.dtos.ads.AdsResponseDto;
import com.ants.ktc.ants_ktc.dtos.ads.CreateAdsDto;
import com.ants.ktc.ants_ktc.dtos.ads.UpdateAdsDto;
import com.ants.ktc.ants_ktc.entities.Ads;
import com.ants.ktc.ants_ktc.services.AdsService;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.validation.ConstraintViolation;
import jakarta.validation.Validator;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.Set;
import java.util.UUID;

@RestController
@RequestMapping("/api/ads")
@CrossOrigin(origins = "*")
public class AdsController {

    @Autowired
    private AdsService adsService;

    @Autowired
    private Validator validator;

    @PostMapping(consumes = { "multipart/form-data" })
    public ResponseEntity<AdsResponseDto> createAds(
            @RequestPart("ads") String adsJson,
            @RequestPart("image") MultipartFile imageFile) throws IOException {
        try {
            if (imageFile.isEmpty()) {
                return ResponseEntity.badRequest().build();
            }

            // Parse JSON to DTO
            CreateAdsDto createDto = new ObjectMapper().readValue(adsJson, CreateAdsDto.class);

            // Validate
            Set<ConstraintViolation<CreateAdsDto>> violations = validator.validate(createDto);
            if (!violations.isEmpty()) {
                String errorMsg = violations.stream()
                        .map(v -> v.getPropertyPath() + ": " + v.getMessage())
                        .reduce((a, b) -> a + ", " + b)
                        .orElse("Validation error");
                throw new IllegalArgumentException(errorMsg);
            }

            AdsResponseDto createdAds = adsService.createAds(createDto, imageFile);
            return ResponseEntity.status(HttpStatus.CREATED).body(createdAds);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @PutMapping(value = "/{id}", consumes = { "multipart/form-data" })
    public ResponseEntity<AdsResponseDto> updateAds(
            @PathVariable("id") UUID id,
            @RequestPart("ads") String adsJson,
            @RequestPart(value = "image", required = false) MultipartFile imageFile) throws IOException {
        try {
            // Parse JSON to DTO
            UpdateAdsDto updateDto = new ObjectMapper().readValue(adsJson, UpdateAdsDto.class);
            updateDto.setId(id);

            // Validate
            Set<ConstraintViolation<UpdateAdsDto>> violations = validator.validate(updateDto);
            if (!violations.isEmpty()) {
                String errorMsg = violations.stream()
                        .map(v -> v.getPropertyPath() + ": " + v.getMessage())
                        .reduce((a, b) -> a + ", " + b)
                        .orElse("Validation error");
                throw new IllegalArgumentException(errorMsg);
            }

            AdsResponseDto updatedAds = adsService.updateAds(updateDto, imageFile);
            return ResponseEntity.ok(updatedAds);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteAds(@PathVariable("id") UUID id) {
        try {
            adsService.deleteAds(id);
            return ResponseEntity.noContent().build();
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    // @GetMapping("/{id}")
    // public ResponseEntity<AdsResponseDto> getAdsById(@PathVariable("id") UUID id) {
    //     try {
    //         AdsResponseDto ads = adsService.getAdsById(id);
    //         return ResponseEntity.ok(ads);
    //     } catch (RuntimeException e) {
    //         return ResponseEntity.notFound().build();
    //     }
    // }

    @GetMapping
    public ResponseEntity<Page<AdsResponseDto>> getAllAds(
            @RequestParam(name = "page", defaultValue = "0") int page,
            @RequestParam(name = "size", defaultValue = "10") int size,
            @RequestParam(name = "sortBy", defaultValue = "createdDate") String sortBy,
            @RequestParam(name = "sortDir", defaultValue = "desc") String sortDir) {
        Page<AdsResponseDto> adsPage = adsService.getAllAds(page, size, sortBy, sortDir);
        return ResponseEntity.ok(adsPage);
    }

    // @GetMapping("/active")
    // public ResponseEntity<List<AdsResponseDto>> getActiveAds() {
    //     List<AdsResponseDto> activeAds = adsService.getActiveAds();
    //     return ResponseEntity.ok(activeAds);
    // }

    @GetMapping("/active/{position}")
    public ResponseEntity<List<AdsResponseDto>> getActiveAdsByPosition(@PathVariable("position") String position) {
        try {
            Ads.AdsPosition adsPosition = Ads.AdsPosition.valueOf(position.toUpperCase());
            List<AdsResponseDto> activeAds = adsService.getActiveAdsByPosition(adsPosition);
            return ResponseEntity.ok(activeAds);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    // @GetMapping("/search")
    // public ResponseEntity<Page<AdsResponseDto>> searchAds(
    //         @RequestParam("keyword") String keyword,
    //         @RequestParam(name = "page", defaultValue = "0") int page,
    //         @RequestParam(name = "size", defaultValue = "10") int size) {
    //     Page<AdsResponseDto> adsPage = adsService.searchAds(keyword, page, size);
    //     return ResponseEntity.ok(adsPage);
    // }

    @PatchMapping("/{id}/toggle-status")
    public ResponseEntity<AdsResponseDto> toggleAdsStatus(@PathVariable("id") UUID id) {
        try {
            AdsResponseDto updatedAds = adsService.toggleAdsStatus(id);
            return ResponseEntity.ok(updatedAds);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }
}
