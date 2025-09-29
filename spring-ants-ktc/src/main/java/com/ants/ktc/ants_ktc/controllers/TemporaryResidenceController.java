package com.ants.ktc.ants_ktc.controllers;

import com.ants.ktc.ants_ktc.dtos.temporary_residence.TemporaryResidenceCreateRequest;
import com.ants.ktc.ants_ktc.dtos.temporary_residence.TemporaryResidenceResponse;
import com.ants.ktc.ants_ktc.dtos.temporary_residence.TemporaryResidenceUpdateRequest;
import com.ants.ktc.ants_ktc.services.TemporaryResidenceService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/temporary-residences")
public class TemporaryResidenceController {
    @Autowired
    private TemporaryResidenceService temporaryResidenceService;

    @PostMapping
    public ResponseEntity<TemporaryResidenceResponse> create(
            @Valid @RequestPart("data") TemporaryResidenceCreateRequest request,
            @RequestPart(value = "frontImage", required = false) MultipartFile frontImage,
            @RequestPart(value = "backImage", required = false) MultipartFile backImage) {
        return ResponseEntity.ok(temporaryResidenceService.create(request, frontImage, backImage));
    }

    @PutMapping("/{id}")
    public ResponseEntity<TemporaryResidenceResponse> update(
            @PathVariable("id") UUID id,
            @Valid @RequestPart("data") TemporaryResidenceUpdateRequest request,
            @RequestPart(value = "frontImage", required = false) MultipartFile frontImage,
            @RequestPart(value = "backImage", required = false) MultipartFile backImage) {
        return ResponseEntity.ok(temporaryResidenceService.update(id, request, frontImage, backImage));
    }

    @GetMapping("/contract/{contractId}")
    public ResponseEntity<List<TemporaryResidenceResponse>> getByContract(@PathVariable("contractId") UUID contractId) {
        return ResponseEntity.ok(temporaryResidenceService.getByContract(contractId));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable("id") UUID id) {
        temporaryResidenceService.delete(id);
        return ResponseEntity.noContent().build();
    }
    @GetMapping("/landlord/{landlordId}")
    public ResponseEntity<List<TemporaryResidenceResponse>> getByLandlord(
            @PathVariable("landlordId") UUID landlordId) {
        return ResponseEntity.ok(temporaryResidenceService.getByLandlord(landlordId));
    }
    @GetMapping("/tenant/{tenantId}")
    public ResponseEntity<List<TemporaryResidenceResponse>> getByTenant(
            @PathVariable("tenantId") UUID tenantId) {
        return ResponseEntity.ok(temporaryResidenceService.getByTenant(tenantId));
    }
}
