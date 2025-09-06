package com.ants.ktc.ants_ktc.controllers;

import java.util.UUID;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.ants.ktc.ants_ktc.dtos.favorite.PageResponse;
import com.ants.ktc.ants_ktc.repositories.projection.landlord.LandlordDetailProjection;
import com.ants.ktc.ants_ktc.repositories.projection.landlord.LandlordProjectionCustom;
import com.ants.ktc.ants_ktc.repositories.projection.landlord.RoomProjectionForLandlord;
import com.ants.ktc.ants_ktc.services.LandlordService;

@RestController
@RequestMapping("/api/landlords")
public class LandlordController {

    @Autowired
    private LandlordService landlordService;

    @GetMapping
    public ResponseEntity<PageResponse<LandlordProjectionCustom>> getAllLandlords(
            @RequestParam(name = "page", defaultValue = "0") int page,
            @RequestParam(name = "size", defaultValue = "6") int size) {

        PageResponse<LandlordProjectionCustom> response = landlordService.getAllLandlords(page, size);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{landlordId}")
    public ResponseEntity<LandlordDetailProjection> getLandlordDetail(
            @PathVariable("landlordId") UUID landlordId) {

        LandlordDetailProjection landlord = landlordService.getLandlordDetail(landlordId);
        return ResponseEntity.ok(landlord);
    }

    @GetMapping("/{landlordId}/rooms")
    public ResponseEntity<PageResponse<RoomProjectionForLandlord>> getLandlordRooms(
            @PathVariable("landlordId") UUID landlordId,
            @RequestParam(name = "page", defaultValue = "0") int page,
            @RequestParam(name = "size", defaultValue = "10") int size) {

        PageResponse<RoomProjectionForLandlord> rooms = landlordService.getLandlordActiveRooms(landlordId, page, size);
        return ResponseEntity.ok(rooms);
    }

}