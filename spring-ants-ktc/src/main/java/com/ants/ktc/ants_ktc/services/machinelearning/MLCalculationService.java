package com.ants.ktc.ants_ktc.services.machinelearning;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import com.ants.ktc.ants_ktc.entities.*;
import com.ants.ktc.ants_ktc.entities.address.Address;
import com.ants.ktc.ants_ktc.repositories.*;

/**
 * Unified service for all ML calculation operations
 * Contains similarity calculations, geographical calculations, content-based
 * filtering, and user preference building
 */
@Service
public class MLCalculationService {

    @Autowired
    private FavoriteJpaRepository favoriteJpaRepository;

    @Autowired
    private RoomJpaRepository roomRepository;

    // Content-Based Filtering weights for room matching criteria
    private static final double PRICE_WEIGHT = 0.25;
    private static final double AREA_WEIGHT = 0.20;
    private static final double LOCATION_WEIGHT = 0.20;
    private static final double DIMENSION_WEIGHT = 0.15; // roomLength + roomWidth
    private static final double UTILITY_WEIGHT = 0.10; // elecPrice + waterPrice
    private static final double CAPACITY_WEIGHT = 0.10; // maxPeople

    // Search radius in kilometers
    private static final double SEARCH_RADIUS_KM = 10.0;

    // ========================= SIMILARITY CALCULATIONS =========================

    public double calculateContentBasedSimilarity(UserPreferenceProfile profile, Room room) {
        double totalScore = 0.0;

        // 1. Price matching (25% weight)
        if (profile.getAvgPriceMonth() != null && room.getPrice_month() != null) {
            double priceScore = calculateFeatureSimilarity(
                    profile.getAvgPriceMonth(), room.getPrice_month(), 0.3); // 30% tolerance
            totalScore += priceScore * PRICE_WEIGHT;
        }

        // 2. Area matching (20% weight)
        if (profile.getAvgArea() != null && room.getArea() != null) {
            double areaScore = calculateFeatureSimilarity(
                    profile.getAvgArea(), room.getArea(), 0.4); // 40% tolerance
            totalScore += areaScore * AREA_WEIGHT;
        }

        // 3. Room dimensions matching (15% weight)
        double dimensionScore = calculateDimensionSimilarity(profile, room);
        totalScore += dimensionScore * DIMENSION_WEIGHT;

        // 4. Utility prices matching (10% weight)
        double utilityScore = calculateUtilitySimilarity(profile, room);
        totalScore += utilityScore * UTILITY_WEIGHT;

        // 5. Capacity matching (10% weight)
        if (profile.getAvgMaxPeople() != null && room.getMaxPeople() != null) {
            double capacityScore = calculateFeatureSimilarity(
                    profile.getAvgMaxPeople().doubleValue(), room.getMaxPeople().doubleValue(), 0.5); // 50% tolerance
            totalScore += capacityScore * CAPACITY_WEIGHT;
        }

        // 6. Location bonus (20% weight) - closer is better
        if (profile.getUserAddress() != null && room.getAddress() != null) {
            double distance = calculateDistance(profile.getUserAddress(), room.getAddress());
            double locationScore = Math.max(0, 1.0 - (distance / SEARCH_RADIUS_KM)); // Linear decay
            totalScore += locationScore * LOCATION_WEIGHT;
        }

        return Math.min(1.0, totalScore); // Cap at 100%
    }

    /**
     * Calculate similarity between two numeric features with tolerance
     */
    public double calculateFeatureSimilarity(double userPref, double roomValue, double tolerance) {
        double diff = Math.abs(userPref - roomValue);
        double maxDiff = userPref * tolerance;
        return Math.max(0, 1.0 - (diff / Math.max(maxDiff, userPref * 0.1))); // Min 10% tolerance
    }

    /**
     * Calculate dimension similarity (roomLength + roomWidth)
     */
    public double calculateDimensionSimilarity(UserPreferenceProfile profile, Room room) {
        double lengthScore = 0.5; // Default neutral score
        double widthScore = 0.5;

        if (profile.getAvgRoomLength() != null && room.getRoomLength() != null) {
            lengthScore = calculateFeatureSimilarity(
                    profile.getAvgRoomLength(), room.getRoomLength(), 0.3); // 30% tolerance
        }

        if (profile.getAvgRoomWidth() != null && room.getRoomWidth() != null) {
            widthScore = calculateFeatureSimilarity(
                    profile.getAvgRoomWidth(), room.getRoomWidth(), 0.3); // 30% tolerance
        }

        return (lengthScore + widthScore) / 2.0;
    }

    /**
     * Calculate utility prices similarity (elecPrice + waterPrice)
     */
    public double calculateUtilitySimilarity(UserPreferenceProfile profile, Room room) {
        double elecScore = 0.5; // Default neutral score
        double waterScore = 0.5;

        if (profile.getAvgElecPrice() != null && room.getElecPrice() != null) {
            elecScore = calculateFeatureSimilarity(
                    profile.getAvgElecPrice(), room.getElecPrice(), 0.4); // 40% tolerance
        }

        if (profile.getAvgWaterPrice() != null && room.getWaterPrice() != null) {
            waterScore = calculateFeatureSimilarity(
                    profile.getAvgWaterPrice(), room.getWaterPrice(), 0.4); // 40% tolerance
        }

        return (elecScore + waterScore) / 2.0;
    }

    /**
     * Calculate detailed similarity breakdown for debugging
     */
    public Map<String, Double> calculateDetailedSimilarityBreakdown(UserPreferenceProfile profile,
            Room room) {
        Map<String, Double> breakdown = new HashMap<>();

        // Price score (25% weight)
        if (profile.getAvgPriceMonth() != null && room.getPrice_month() != null) {
            double priceScore = calculateFeatureSimilarity(profile.getAvgPriceMonth(), room.getPrice_month(), 0.3);
            breakdown.put("priceScore", priceScore * PRICE_WEIGHT);
        }

        // Area score (20% weight)
        if (profile.getAvgArea() != null && room.getArea() != null) {
            double areaScore = calculateFeatureSimilarity(profile.getAvgArea(), room.getArea(), 0.4);
            breakdown.put("areaScore", areaScore * AREA_WEIGHT);
        }

        // Dimension score (15% weight)
        double dimensionScore = calculateDimensionSimilarity(profile, room);
        breakdown.put("dimensionScore", dimensionScore * DIMENSION_WEIGHT);

        // Utility score (10% weight)
        double utilityScore = calculateUtilitySimilarity(profile, room);
        breakdown.put("utilityScore", utilityScore * UTILITY_WEIGHT);

        // Capacity score (10% weight)
        if (profile.getAvgMaxPeople() != null && room.getMaxPeople() != null) {
            double capacityScore = calculateFeatureSimilarity(
                    profile.getAvgMaxPeople().doubleValue(), room.getMaxPeople().doubleValue(), 0.5);
            breakdown.put("capacityScore", capacityScore * CAPACITY_WEIGHT);
        }

        // Location score (20% weight)
        if (profile.getUserAddress() != null && room.getAddress() != null) {
            double distance = calculateDistance(profile.getUserAddress(), room.getAddress());
            double locationScore = Math.max(0, 1.0 - (distance / SEARCH_RADIUS_KM));
            breakdown.put("locationScore", locationScore * LOCATION_WEIGHT);
        }

        return breakdown;
    }

    // ========================= GEOGRAPHICAL CALCULATIONS =========================

    /**
     * Calculate distance between two addresses using Haversine formula
     */
    public double calculateDistance(Address addr1, Address addr2) {
        // Use lat/lng if available
        if (addr1.getLat() != null && addr1.getLng() != null &&
                addr2.getLat() != null && addr2.getLng() != null) {

            return haversineDistance(
                    addr1.getLat(), addr1.getLng(),
                    addr2.getLat(), addr2.getLng());
        }

        // Fallback: estimate distance by administrative division
        if (addr1.getWard() != null && addr2.getWard() != null) {
            if (addr1.getWard().getId().equals(addr2.getWard().getId())) {
                return 1.0; // Same ward - ~1km
            }
            if (addr1.getWard().getDistrict() != null && addr2.getWard().getDistrict() != null &&
                    addr1.getWard().getDistrict().getId().equals(addr2.getWard().getDistrict().getId())) {
                return 5.0; // Same district - ~5km
            }
        }

        return 50.0; // Different city/province - assume far
    }

    /**
     * Haversine formula for calculating distance between coordinates
     */
    public double haversineDistance(double lat1, double lon1, double lat2, double lon2) {
        final int R = 6371; // Earth radius in km

        double latDistance = Math.toRadians(lat2 - lat1);
        double lonDistance = Math.toRadians(lon2 - lon1);

        double a = Math.sin(latDistance / 2) * Math.sin(latDistance / 2)
                + Math.cos(Math.toRadians(lat1)) * Math.cos(Math.toRadians(lat2))
                        * Math.sin(lonDistance / 2) * Math.sin(lonDistance / 2);

        double c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

        return R * c;
    }

    /**
     * Check if two addresses are within specified radius
     */
    public boolean isWithinRadius(Address addr1, Address addr2, double radiusKm) {
        if (addr1 == null || addr2 == null)
            return false;
        return calculateDistance(addr1, addr2) <= radiusKm;
    }

    /**
     * Build address string from Address object
     */
    public String buildAddressString(Address address) {
        if (address == null)
            return "Không có địa chỉ";

        StringBuilder addressBuilder = new StringBuilder();
        if (address.getStreet() != null) {
            addressBuilder.append(address.getStreet());
        }
        if (address.getWard() != null) {
            if (addressBuilder.length() > 0)
                addressBuilder.append(", ");
            addressBuilder.append(address.getWard().getName());

            if (address.getWard().getDistrict() != null) {
                addressBuilder.append(", ").append(address.getWard().getDistrict().getName());

                if (address.getWard().getDistrict().getProvince() != null) {
                    addressBuilder.append(", ").append(address.getWard().getDistrict().getProvince().getName());
                }
            }
        }
        return addressBuilder.length() > 0 ? addressBuilder.toString() : "Không có địa chỉ";
    }

    // ========================= CONTENT-BASED FILTERING =========================

    /**
     * Find suggested rooms using Content-Based Filtering ML algorithm
     */
    public List<RoomSuggestion> findSuggestedRoomsML(User user,
            UserPreferenceProfile profile) {
        System.out.println("[MLCalculationService] Search radius: " +
                SEARCH_RADIUS_KM + "km, Similarity threshold: 75%");

        // Get available rooms
        List<Room> availableRooms;
        Address userAddress = profile.getUserAddress();

        if (userAddress != null &&
                userAddress.getLat() != null &&
                userAddress.getLng() != null) {

            // Use radius-based query with Haversine formula in database
            availableRooms = roomRepository.findRoomsWithinRadiusForML(
                    userAddress.getLat(),
                    userAddress.getLng(),
                    SEARCH_RADIUS_KM,
                    user.getId().toString());

        } else {
            // Fallback to basic available rooms query
            availableRooms = roomRepository.findAvailableRoomsForML(user.getId());
        }

        List<RoomSuggestion> suggestions = new ArrayList<>();

        for (Room room : availableRooms) {
            // Calculate similarity score using Content-Based Filtering
            double similarityScore = calculateContentBasedSimilarity(profile, room);

            // Only suggest rooms with high similarity (threshold: 75%)
            if (similarityScore >= 0.75) {
                suggestions.add(new RoomSuggestion(room, similarityScore));
            }
        }

        // Sort by similarity score (descending) and return top 5
        List<RoomSuggestion> finalSuggestions = suggestions.stream()
                .sorted((s1, s2) -> Double.compare(s2.getSimilarityScore(), s1.getSimilarityScore()))
                .limit(5)
                .collect(Collectors.toList());

        return finalSuggestions;
    }

    // ========================= USER PREFERENCE BUILDING =========================

    public UserPreferenceProfile buildUserPreferenceProfile(User user) {
        UserPreferenceProfile profile = new UserPreferenceProfile();

        // Get user's favorites
        List<Favorite> favorites = favoriteJpaRepository.findByUserIdWithRoom(user.getId(), Pageable.unpaged())
                .getContent();
        for (Favorite favorite : favorites) {
            profile.addRoomData(favorite.getRoom());
        }

        // Calculate averages and set user location
        profile.calculateAverages();
        Address userAddress = getUserAddress(user);
        profile.setUserAddress(userAddress);

        return profile;
    }

    public Address getUserAddress(User user) {
        // Debug: Check if user object exists (defensive programming)
        if (user == null) {
            return null;
        }

        // Debug: Check if user has profile
        if (user.getProfile() == null) {
            return null;
        }

        UserProfile userProfile = user.getProfile();

        // Check if user has search coordinates in profile (search_latitude,
        // search_longitude)
        if (userProfile.getSearchLatitude() == null || userProfile.getSearchLongitude() == null) {
            return null;
        }

        // Create Address object with search coordinates from user_profile
        Address searchAddress = new Address();
        searchAddress.setLat(userProfile.getSearchLatitude());
        searchAddress.setLng(userProfile.getSearchLongitude());

        // If user also has profile address, add it for context but use search
        // coordinates
        if (userProfile.getAddress() != null) {
            Address profileAddress = userProfile.getAddress();
            searchAddress.setStreet(profileAddress.getStreet());
            searchAddress.setWard(profileAddress.getWard());
        }

        return searchAddress;
    }

    /**
     * Get users who have preference data (favorites)
     */
    public List<User> getUsersWithPreferences(List<User> allUsers) {
        return allUsers.stream()
                .filter(user -> {
                    List<Favorite> favorites = favoriteJpaRepository
                            .findByUserIdWithRoom(user.getId(), Pageable.unpaged()).getContent();
                    return !favorites.isEmpty();
                })
                .collect(Collectors.toList());
    }

    // ========================= GETTERS =========================

    public double getSearchRadiusKm() {
        return SEARCH_RADIUS_KM;
    }
}
