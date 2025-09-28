package com.ants.ktc.ants_ktc.controllers;

import java.util.UUID;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.ants.ktc.ants_ktc.dtos.requirement.RequirementLandlordResponseDto;
import com.ants.ktc.ants_ktc.dtos.requirement.RequirementPaging;
import com.ants.ktc.ants_ktc.dtos.requirement.RequirementRequestRoomDto;
import com.ants.ktc.ants_ktc.dtos.requirement.RequirementRequestUpdateDto;
import com.ants.ktc.ants_ktc.dtos.requirement.RequirementUserResponseDto;
import com.ants.ktc.ants_ktc.services.RequirementService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/requirements")
public class RequirementController {
    @Autowired
    private RequirementService requirementService;

    @PostMapping("/request-room-with-image")
    public ResponseEntity<RequirementRequestRoomDto> createRequestRoomWithImage(
            @RequestPart("data") @Valid RequirementRequestRoomDto requestRoomDto,
            @RequestPart(value = "image", required = false) MultipartFile image) {
        try {
            RequirementRequestRoomDto result = requirementService.createRequestRoomWithImage(requestRoomDto, image);
            return ResponseEntity.status(HttpStatus.CREATED).body(result);
        } catch (IllegalArgumentException ex) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(null);
        } catch (Exception ex) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
        }
    }

    @PatchMapping("/{idRequirement}/update-with-image")
    public ResponseEntity<RequirementRequestRoomDto> updateRequirementWithImage(
            @PathVariable("idRequirement") UUID idRequirement,
            @RequestPart("data") @Valid RequirementRequestUpdateDto updateDto,
            @RequestPart(value = "image", required = false) MultipartFile image) {
        try {
            RequirementRequestRoomDto result = requirementService.updateRequirementWithImage(idRequirement, updateDto,
                    image);
            return ResponseEntity.ok(result);
        } catch (IllegalArgumentException ex) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(null);
        } catch (Exception ex) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
        }
    }

    // upload image
    @PostMapping("/{idRequirement}/upload-image")
    public ResponseEntity<String> uploadRequirementImage(
            @PathVariable("idRequirement") UUID idRequirement,
            @RequestParam("image") MultipartFile image) {
        try {
            boolean isUploaded = requirementService.uploadRequirementImage(idRequirement,
                    image);
            if (isUploaded) {
                return ResponseEntity.ok("Image uploaded successfully");
            } else {
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                        .body("Failed to upload image");
            }
        } catch (IllegalArgumentException ex) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body("Requirement not found");
        } catch (Exception ex) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error uploading image: " + ex.getMessage());
        }
    }

    ////
    @GetMapping("/landlord/{landlordId}/requests")
    public ResponseEntity<RequirementPaging<RequirementLandlordResponseDto>> getAllRequestsForLandlord(
            @PathVariable("landlordId") UUID landlordId,
            @RequestParam(value = "page", defaultValue = "0") int page,
            @RequestParam(value = "size", defaultValue = "5") int size) {
        RequirementPaging<RequirementLandlordResponseDto> requests = requirementService
                .getAllRequestsForLandlord(landlordId, page, size);
        return ResponseEntity.ok(requests);
    }

    @GetMapping("/user/{userId}/requests")
    public ResponseEntity<RequirementPaging<RequirementUserResponseDto>> getAllRequestsForUser(
            @PathVariable("userId") UUID userId,
            @RequestParam(value = "page", defaultValue = "0") int page,
            @RequestParam(value = "size", defaultValue = "5") int size) {
        RequirementPaging<RequirementUserResponseDto> requests = requirementService
                .getAllRequestsForUser(userId, page, size);
        return ResponseEntity.ok(requests);
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<String> updateRequirementStatus(@PathVariable("id") UUID id) {
        try {
            requirementService.updateRequirementStatus(id);
            return ResponseEntity.ok("Requirement status updated successfully");
        } catch (IllegalArgumentException ex) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body("Requirement not found or not updated");
        }
    }

    @PatchMapping("/{id}/reject")
    public ResponseEntity<String> rejectRequirement(@PathVariable("id") UUID id) {
        try {
            requirementService.rejectRequirement(id);
            return ResponseEntity.ok("Requirement rejected successfully");
        } catch (IllegalArgumentException ex) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body("Requirement not found or not updated");
        }
    }

    @PatchMapping("/update")
    public ResponseEntity<String> updateRequirement(
            @RequestBody @Valid RequirementRequestUpdateDto requestUpdateDto) {
        try {
            requirementService.updateRequirement(requestUpdateDto);
            return ResponseEntity.ok("Requirement updated successfully");
        } catch (IllegalArgumentException ex) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body("Requirement not found or not updated");
        }
    }
}