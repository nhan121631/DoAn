package com.ants.ktc.ants_ktc.services;

import java.util.UUID;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import com.ants.ktc.ants_ktc.dtos.favorite.PageResponse;
import com.ants.ktc.ants_ktc.repositories.UserJpaRepository;
import com.ants.ktc.ants_ktc.repositories.projection.landlord.LandlordDetailProjection;
import com.ants.ktc.ants_ktc.repositories.projection.landlord.LandlordProjectionCustom;
import com.ants.ktc.ants_ktc.repositories.projection.landlord.RoomProjectionForLandlord;

@Service
public class LandlordService {

    @Autowired
    private UserJpaRepository userRepository;

    public PageResponse<LandlordProjectionCustom> getAllLandlords(int page, int size) {
        try {
            Pageable pageable = PageRequest.of(page, size);
            Page<LandlordProjectionCustom> landlords = userRepository.findAllLandlords(pageable);
            return new PageResponse<>(landlords);
        } catch (Exception e) {
            throw new IllegalArgumentException("Error fetching landlords: " + e.getMessage(), e);
        }
    }

    public LandlordDetailProjection getLandlordDetail(UUID landlordId) {
        return userRepository.findLandlordById(landlordId)
                .orElseThrow(() -> new IllegalArgumentException("Landlord not found with ID: " + landlordId));
    }

    public PageResponse<RoomProjectionForLandlord> getLandlordActiveRooms(UUID landlordId, int page, int size) {
        try {
            Pageable pageable = PageRequest.of(page, size);
            Page<RoomProjectionForLandlord> rooms = userRepository.findActiveRoomsByLandlord(landlordId, pageable);
            return new PageResponse<>(rooms);
        } catch (Exception e) {
            throw new IllegalArgumentException("Error fetching landlord rooms: " + e.getMessage(), e);
        }
    }

}