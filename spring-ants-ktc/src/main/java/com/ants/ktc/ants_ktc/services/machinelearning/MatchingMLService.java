package com.ants.ktc.ants_ktc.services.machinelearning;

import java.util.*;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.Semaphore;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Pageable;
import org.springframework.scheduling.annotation.Async;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.ants.ktc.ants_ktc.entities.*;
import com.ants.ktc.ants_ktc.entities.address.Address;
import com.ants.ktc.ants_ktc.repositories.*;
import com.ants.ktc.ants_ktc.services.MailService;
import com.ants.ktc.ants_ktc.dtos.room.RoomSuggestionInfoDto;

@Service
public class MatchingMLService {

    @Autowired
    private UserJpaRepository userRepository;

    @Autowired
    private RoomJpaRepository roomRepository;

    @Autowired
    private FavoriteJpaRepository favoriteJpaRepository;

    @Autowired
    private MailService mailService;

    @Autowired
    private MLCalculationService mlCalculationService;

    // giới hạn số lượng email gửi đồng thời (tránh spam)
    private final Semaphore emailSemaphore = new Semaphore(3);

    @Scheduled(cron = "0 0 20 * * ?")
    public void sendEveningMLSuggestions() {
        System.out.println("=== [ML SCHEDULED JOB] Starting evening ML room suggestions at 8:00 PM ===");
        sendRoomSuggestionsToAllUsers();
        System.out.println("=== [ML SCHEDULED JOB] Completed evening ML room suggestions ===");
    }

    /**
     * Send ML-based room suggestions to all users who have favorites
     */
    @Transactional(readOnly = true)
    public void sendRoomSuggestionsToAllUsers() {
        try {
            System.out.println("[MatchingMLService] 🚀 Starting ML-based room suggestion process for all users");

            // Get users who have favorites (have preference data)
            List<User> usersWithPreferences = mlCalculationService.getUsersWithPreferences(userRepository.findAll());
            System.out.println("[MatchingMLService] Found " + usersWithPreferences.size() + " users with preferences");

            if (usersWithPreferences.isEmpty()) {
                System.out.println("[MatchingMLService] ❌ No users with preferences found, exiting");
                return;
            }

            List<CompletableFuture<Void>> futures = new ArrayList<>();
            int successCount = 0;

            for (User user : usersWithPreferences) {
                try {
                    System.out.println("[MatchingMLService] 🔄 Processing user " + (successCount + 1) +
                            "/" + usersWithPreferences.size() + ": " + user.getUsername());

                    // Xử lý bất đồng bộ cho từng user để tránh block
                    CompletableFuture<Void> future = processUserMLSuggestionAsync(user);
                    futures.add(future);

                    // Thêm delay nhỏ giữa các user để tránh quá tải
                    Thread.sleep(2000);
                    successCount++;
                } catch (Exception e) {
                    System.out.println(
                            "[MatchingMLService] Failed to process user " + user.getUsername() + ": " + e.getMessage());
                }
            }

            // Đợi tất cả hoàn thành
            System.out.println(
                    "[MatchingMLService] ⏳ Waiting for all " + futures.size() + " async futures to complete...");

            CompletableFuture.allOf(futures.toArray(new CompletableFuture[0])).join();

            System.out.println("[MatchingMLService] ✅ Successfully sent ML suggestions to " +
                    successCount + "/" + usersWithPreferences.size() + " users");

        } catch (Exception e) {
            System.out.println("[MatchingMLService] Error in sendRoomSuggestionsToAllUsers: " + e.getMessage());
            e.printStackTrace();
        }
    }

    /**
     * Process ML suggestions for a single user asynchronously
     */
    @Async
    public CompletableFuture<Void> processUserMLSuggestionAsync(User user) {
        try {
            System.out.println("[MatchingMLService] 🔄 Starting async ML processing for user: " + user.getUsername());

            // Acquire semaphore trước khi gửi email
            emailSemaphore.acquire();
            System.out.println("[MatchingMLService] 🔒 Acquired email semaphore for user: " + user.getUsername());

            try {
                // Kiểm tra user có bật email notifications không
                boolean hasProfile = user.getProfile() != null;
                boolean emailNotificationsEnabled = hasProfile && user.getProfile().isEmailNotifications();

                System.out.println("[MatchingMLService] 📋 User " + user.getUsername() +
                        " - HasProfile: " + hasProfile + ", EmailNotifications: " + emailNotificationsEnabled);

                if (!hasProfile || !emailNotificationsEnabled) {
                    System.out.println(
                            "[MatchingMLService] User " + user.getUsername() + " has email notifications disabled");
                    return CompletableFuture.completedFuture(null);
                }

                System.out
                        .println("[MatchingMLService] 📨 Email notifications enabled for user: " + user.getUsername());

                sendRoomSuggestionsToUser(user);
                System.out.println(
                        "[MatchingMLService] ✅ Completed ML suggestions processing for user: " + user.getUsername());

            } finally {
                // Release semaphore sau khi hoàn thành
                emailSemaphore.release();
            }

        } catch (Exception e) {
            System.out.println("[MatchingMLService] ❌ Error processing ML suggestions for user " +
                    user.getUsername() + ": " + e.getMessage());
        }

        return CompletableFuture.completedFuture(null);
    }

    /**
     * Test ML suggestion for specific user
     */
    public void testSuggestionForUser(String username) {
        Optional<User> userOpt = userRepository.findByUsernameForML(username);
        if (userOpt.isPresent()) {
            System.out.println("[MatchingMLService] === Testing ML suggestion for user: " + username + " ===");
            sendRoomSuggestionsToUser(userOpt.get());
            System.out.println("[MatchingMLService] === ML suggestion test completed for user: " + username + " ===");
        } else {
            System.out.println("[MatchingMLService] User not found for ML test: " + username);
            throw new RuntimeException("User not found: " + username);
        }
    }

    /**
     * Send ML-based room suggestions to specific user
     */
    @Transactional(readOnly = true)
    private void sendRoomSuggestionsToUser(User user) {
        System.out.println("[MatchingMLService] 🚀 STARTING ML suggestions for user: " + user.getUsername());

        // Build user preference profile from favorites
        UserPreferenceProfile profile = mlCalculationService.buildUserPreferenceProfile(user);

        if (profile.isEmpty()) {
            System.out.println("[MatchingMLService] ❌ User " + user.getUsername() + " has no preference data");
            return;
        }

        System.out.println("[MatchingMLService] ✅ User " + user.getUsername() + " has valid preference profile with "
                + profile.getDataPointCount() + " data points");

        // Find suggested rooms using Content-Based Filtering
        List<RoomSuggestion> suggestions = mlCalculationService.findSuggestedRoomsML(user, profile);

        System.out.println("[MatchingMLService] 📋 Found " + suggestions.size() + " room suggestions for user "
                + user.getUsername());

        if (!suggestions.isEmpty()) {
            // Convert to DTO and send email
            List<RoomSuggestionInfoDto> suggestionDtos = suggestions.stream()
                    .map(suggestion -> convertToSuggestionDto(suggestion, profile.getUserAddress()))
                    .collect(Collectors.toList());

            // Kiểm tra email trước khi gửi
            String userEmail = user.getProfile() != null ? user.getProfile().getEmail() : null;
            String userName = user.getProfile() != null ? user.getProfile().getFullName() : user.getUsername();

            System.out.println("[MatchingMLService] 👤 User profile check - Email: " +
                    (userEmail != null ? userEmail : "NULL") + ", Name: " + userName);

            if (userEmail != null && !userEmail.trim().isEmpty()) {
                System.out.println("[MatchingMLService] 📧 About to call sendMLRoomSuggestionEmail with "
                        + suggestionDtos.size() + " suggestions");

                try {
                    System.out.println("[MatchingMLService] 🔄 Calling mailService.sendMLRoomSuggestionEmail NOW!");
                    mailService.sendMLRoomSuggestionEmail(userEmail, userName, suggestionDtos);
                    System.out.println(
                            "[MatchingMLService] ✅ ML MailService call completed for user: " + user.getUsername());
                } catch (Exception e) {
                    System.out.println("[MatchingMLService] ❌ Exception: " + e.getMessage());
                    e.printStackTrace();

                    // Don't re-throw, just log and continue
                    // throw e; // Commented out to prevent async issues
                }

                // Log details of suggested rooms for debugging
                for (int i = 0; i < Math.min(3, suggestions.size()); i++) {
                    RoomSuggestion suggestion = suggestions.get(i);
                    Room room = suggestion.getRoom();
                    System.out.println("[MatchingMLService] Room " + (i + 1) + ": " + room.getTitle() +
                            " (Score: " + String.format("%.2f", suggestion.getSimilarityScore()) + ")");
                }
            } else {

                System.out.println("[MatchingMLService] ❌ User " + user.getUsername() + " has no valid email address");
            }
        } else {

            System.out.println("[MatchingMLService] ❌ No suitable rooms found for user " + user.getUsername());
        }

        System.out.println("[MatchingMLService] 🏁 COMPLETED ML suggestions for user: " + user.getUsername());
    }

    /**
     * Get user with full profile and address information for ML
     */
    private User getUserWithFullAddressInfo(String username) {
        Optional<User> userOpt = userRepository.findByUsernameForML(username);
        if (!userOpt.isPresent()) {
            return null;
        }

        User user = userOpt.get();

        // Force load profile if lazy
        if (user.getProfile() != null) {
            UserProfile profile = user.getProfile();

            // Force load address if lazy
            if (profile.getAddress() != null) {
                Address address = profile.getAddress();
                System.out.println("[MatchingMLService] User address loaded: " + address.getStreet());
            } else {
                System.out.println("[MatchingMLService] User has no address in profile");
            }
        } else {

        }

        return user;
    }

    /**
     * Public method to test address fetching - for debugging only
     */
    public Address getUserAddressForTesting(User user) {
        return mlCalculationService.getUserAddress(user);
    }

    /**
     * Convert RoomSuggestion to RoomSuggestionInfoDto with distance calculation
     */
    private RoomSuggestionInfoDto convertToSuggestionDto(RoomSuggestion suggestion, Address userAddress) {
        Room room = suggestion.getRoom();
        RoomSuggestionInfoDto dto = new RoomSuggestionInfoDto();

        dto.setId(room.getId());
        dto.setTitle(room.getTitle());
        dto.setPriceMonth(room.getPrice_month());
        dto.setArea(room.getArea());
        dto.setDescription(room.getDescription());

        // Build address string
        StringBuilder addressBuilder = new StringBuilder();
        if (room.getAddress() != null) {
            if (room.getAddress().getStreet() != null) {
                addressBuilder.append(room.getAddress().getStreet());
            }
            if (room.getAddress().getWard() != null) {
                if (addressBuilder.length() > 0)
                    addressBuilder.append(", ");
                addressBuilder.append(room.getAddress().getWard().getName());

                if (room.getAddress().getWard().getDistrict() != null) {
                    addressBuilder.append(", ").append(room.getAddress().getWard().getDistrict().getName());

                    if (room.getAddress().getWard().getDistrict().getProvince() != null) {
                        addressBuilder.append(", ")
                                .append(room.getAddress().getWard().getDistrict().getProvince().getName());
                    }
                }
            }
        }
        dto.setAddress(addressBuilder.toString());

        // Landlord info
        if (room.getUser() != null && room.getUser().getProfile() != null) {
            UserProfile profile = room.getUser().getProfile();
            dto.setLandlordName(profile.getFullName() != null ? profile.getFullName() : room.getUser().getUsername());
            dto.setLandlordEmail(profile.getEmail());
            dto.setLandlordPhone(profile.getPhoneNumber());
        }

        // Calculate and set distance if both addresses are available
        if (userAddress != null && room.getAddress() != null) {
            try {
                double distance = mlCalculationService.calculateDistance(userAddress, room.getAddress());
                dto.setDistanceKm(distance);

            } catch (Exception e) {

                dto.setDistanceKm(null);
            }
        } else {
            dto.setDistanceKm(null);
        }

        return dto;
    }

    /**
     * Convert RoomSuggestion to RoomSuggestionInfoDto (backward compatibility)
     * This method is kept for potential future use in other services
     */
    @SuppressWarnings("unused")
    private RoomSuggestionInfoDto convertToSuggestionDto(RoomSuggestion suggestion) {
        return convertToSuggestionDto(suggestion, null);
    }

    /**
     * Debug method to check user address and email settings
     */
    public Map<String, Object> debugUserForML(String username) {

        // Use improved user fetching method
        User user = getUserWithFullAddressInfo(username);
        if (user == null) {
            throw new RuntimeException("User not found: " + username);
        }

        Map<String, Object> debug = new HashMap<>();

        // Check user profile
        debug.put("username", username);
        debug.put("hasProfile", user.getProfile() != null);

        if (user.getProfile() != null) {
            UserProfile profile = user.getProfile();
            debug.put("email", profile.getEmail());
            debug.put("fullName", profile.getFullName());
            debug.put("emailNotifications", profile.isEmailNotifications());

            // Search coordinates from user_profile (primary for ML)
            debug.put("searchLatitude", profile.getSearchLatitude());
            debug.put("searchLongitude", profile.getSearchLongitude());
            debug.put("hasSearchCoordinates",
                    profile.getSearchLatitude() != null && profile.getSearchLongitude() != null);

            // Address info (secondary)
            debug.put("hasAddress", profile.getAddress() != null);
            if (profile.getAddress() != null) {
                Address addr = profile.getAddress();
                debug.put("street", addr.getStreet());
                debug.put("addressLat", addr.getLat());
                debug.put("addressLng", addr.getLng());
                debug.put("hasAddressCoordinates", addr.getLat() != null && addr.getLng() != null);
            }
        }

        // Check preferences
        List<Favorite> favorites = favoriteJpaRepository.findByUserIdWithRoom(user.getId(), Pageable.unpaged())
                .getContent();
        debug.put("favoritesCount", favorites.size());
        debug.put("hasPreferences", !favorites.isEmpty());

        return debug;
    }

    // ================= DIAGNOSTIC AND TESTING METHODS =================

    public Map<String, Object> getUserPreferenceProfile(String username) {

        // Use improved user fetching method
        User user = getUserWithFullAddressInfo(username);
        if (user == null) {
            throw new RuntimeException("User not found: " + username);
        }

        UserPreferenceProfile profile = mlCalculationService.buildUserPreferenceProfile(user);

        // Get detailed favorite rooms
        List<Favorite> favorites = favoriteJpaRepository.findByUserIdWithRoom(user.getId(), Pageable.unpaged())
                .getContent();

        // Build detailed room info for favorites
        List<Map<String, Object>> favoriteRoomDetails = new ArrayList<>();
        for (Favorite favorite : favorites) {
            Room room = favorite.getRoom();
            Map<String, Object> roomInfo = new HashMap<>();
            roomInfo.put("id", room.getId());
            roomInfo.put("title", room.getTitle());
            roomInfo.put("priceMonth", room.getPrice_month());
            roomInfo.put("area", room.getArea());
            roomInfo.put("roomLength", room.getRoomLength());
            roomInfo.put("roomWidth", room.getRoomWidth());
            roomInfo.put("elecPrice", room.getElecPrice());
            roomInfo.put("waterPrice", room.getWaterPrice());
            roomInfo.put("maxPeople", room.getMaxPeople());
            roomInfo.put("type", "favorite");

            // Add address if available
            if (room.getAddress() != null) {
                roomInfo.put("address", mlCalculationService.buildAddressString(room.getAddress()));
                if (room.getAddress().getLat() != null && room.getAddress().getLng() != null) {
                    roomInfo.put("coordinates", Map.of(
                            "lat", room.getAddress().getLat(),
                            "lng", room.getAddress().getLng()));
                }
            }
            favoriteRoomDetails.add(roomInfo);
        }

        Map<String, Object> result = new HashMap<>();
        result.put("username", username);
        result.put("isEmpty", profile.isEmpty());

        // ML preference averages
        Map<String, Object> mlProfile = new HashMap<>();
        mlProfile.put("avgPriceMonth", profile.getAvgPriceMonth());
        mlProfile.put("avgArea", profile.getAvgArea());
        mlProfile.put("avgRoomLength", profile.getAvgRoomLength());
        mlProfile.put("avgRoomWidth", profile.getAvgRoomWidth());
        mlProfile.put("avgElecPrice", profile.getAvgElecPrice());
        mlProfile.put("avgWaterPrice", profile.getAvgWaterPrice());
        mlProfile.put("avgMaxPeople", profile.getAvgMaxPeople());
        mlProfile.put("dataPoints", profile.getDataPointCount());
        result.put("mlProfile", mlProfile);

        // Detailed room data
        Map<String, Object> detailedData = new HashMap<>();
        detailedData.put("favoritesCount", favorites.size());
        detailedData.put("favoriteRooms", favoriteRoomDetails);
        result.put("detailedData", detailedData);

        // User address info
        if (profile.getUserAddress() != null) {
            Address userAddr = profile.getUserAddress();
            Map<String, Object> userLocation = new HashMap<>();
            userLocation.put("address", mlCalculationService.buildAddressString(userAddr));
            if (userAddr.getLat() != null && userAddr.getLng() != null) {
                userLocation.put("coordinates", Map.of(
                        "lat", userAddr.getLat(),
                        "lng", userAddr.getLng()));
            }
            result.put("userLocation", userLocation);
        }

        return result;
    }

    /**
     * Calculate similarity score for testing specific room
     */
    public Map<String, Object> calculateSimilarityScore(String username, UUID roomId) {
        Optional<User> userOpt = userRepository.findByUsernameForML(username);
        if (!userOpt.isPresent()) {
            throw new RuntimeException("User not found: " + username);
        }

        // Use optimized findById with address fetch
        Optional<Room> roomOpt = roomRepository.findDetailedById(roomId);
        if (!roomOpt.isPresent()) {
            throw new RuntimeException("Room not found: " + roomId);
        }

        User user = userOpt.get();
        Room room = roomOpt.get();
        UserPreferenceProfile profile = mlCalculationService.buildUserPreferenceProfile(user);

        double similarity = mlCalculationService.calculateContentBasedSimilarity(profile, room);

        // Calculate detailed breakdown for debugging
        Map<String, Double> breakdownScores = mlCalculationService.calculateDetailedSimilarityBreakdown(profile, room);

        Map<String, Object> result = new HashMap<>();
        result.put("username", username);
        result.put("roomId", roomId);
        result.put("roomTitle", room.getTitle());
        result.put("roomPrice", room.getPrice_month());
        result.put("roomArea", room.getArea());
        result.put("similarityScore", similarity);
        result.put("isWithinRadius", mlCalculationService.isWithinRadius(profile.getUserAddress(), room.getAddress(),
                mlCalculationService.getSearchRadiusKm()));
        result.put("detailedBreakdown", breakdownScores);

        // Add distance info if available
        if (profile.getUserAddress() != null && room.getAddress() != null) {
            double distance = mlCalculationService.calculateDistance(profile.getUserAddress(), room.getAddress());
            result.put("distanceKm", distance);
        }

        return result;
    }

    /**
     * Get ML statistics for debugging
     */
    public Map<String, Object> getMLStatistics() {
        Map<String, Object> stats = new HashMap<>();

        long totalUsers = userRepository.count();
        long totalRooms = roomRepository.count();
        long usersWithPreferences = mlCalculationService.getUsersWithPreferences(userRepository.findAll()).size();

        // Use optimized query instead of findAll() + stream filtering
        long availableRoomsCount = roomRepository.countByIsRemovedAndHidden(0, 0);

        // Count average ML available rooms by sampling a few real users
        long mlAvailableRooms = calculateAverageMLAvailableRooms();

        stats.put("totalUsers", totalUsers);
        stats.put("totalRooms", totalRooms);
        stats.put("availableRooms", availableRoomsCount); // Rooms not deleted/hidden
        stats.put("mlAvailableRooms", mlAvailableRooms); // Average rooms available for ML suggestions per user
        stats.put("usersWithPreferences", usersWithPreferences);
        stats.put("mlAlgorithm", "Content-Based Filtering with Optimized JPA Queries");
        stats.put("searchRadiusKm", mlCalculationService.getSearchRadiusKm());
        stats.put("mlCoverage", String.format("%.1f%%", (double) mlAvailableRooms / availableRoomsCount * 100));
        stats.put("userCoverage", String.format("%.1f%%", (double) usersWithPreferences / totalUsers * 100));
        stats.put("queryOptimizations", Arrays.asList(
                "Haversine distance in database",
                "JPA @Query with JOIN FETCH",
                "Exclude user favorites in query",
                "Radius filtering in SQL"));
        stats.put("matchingCriteria", Arrays.asList(
                "price_month", "area", "roomLength", "roomWidth",
                "elecPrice", "waterPrice", "maxPeople", "location"));

        return stats;
    }

    /**
     * Calculate average number of ML available rooms by sampling real users
     * This gives a more accurate representation than using dummy UUID
     */
    private long calculateAverageMLAvailableRooms() {
        try {
            List<User> usersWithPreferences = mlCalculationService.getUsersWithPreferences(userRepository.findAll());

            if (usersWithPreferences.isEmpty()) {
                // Fallback: return total available rooms if no users with preferences
                return roomRepository.countByIsRemovedAndHidden(0, 0);
            }

            // Sample up to 5 users to calculate average
            int sampleSize = Math.min(5, usersWithPreferences.size());
            long totalMLRooms = 0;

            for (int i = 0; i < sampleSize; i++) {
                User user = usersWithPreferences.get(i);
                List<Room> mlRooms = roomRepository.findAvailableRoomsForML(user.getId());
                totalMLRooms += mlRooms.size();
            }

            return totalMLRooms / sampleSize; // Average across sampled users

        } catch (Exception e) {

            // Fallback to total available rooms
            return roomRepository.countByIsRemovedAndHidden(0, 0);
        }
    }

    /**
     * Get rooms within radius for user analysis and debugging
     */
    public Map<String, Object> getRoomsInRadius(String username) {

        // Use improved user fetching method
        User user = getUserWithFullAddressInfo(username);
        if (user == null) {
            throw new RuntimeException("User not found: " + username);
        }

        Address userAddress = mlCalculationService.getUserAddress(user);

        Map<String, Object> result = new HashMap<>();
        result.put("username", username);

        // User location info
        if (userAddress != null) {
            Map<String, Object> userLocation = new HashMap<>();
            userLocation.put("address", mlCalculationService.buildAddressString(userAddress));
            if (userAddress.getLat() != null && userAddress.getLng() != null) {
                userLocation.put("coordinates", Map.of(
                        "lat", userAddress.getLat(),
                        "lng", userAddress.getLng()));
                result.put("userLocation", userLocation);
                result.put("hasValidCoordinates", true);

                // Get rooms within radius using ML query

                List<Room> roomsInRadius = roomRepository.findRoomsWithinRadiusForML(
                        userAddress.getLat(),
                        userAddress.getLng(),
                        mlCalculationService.getSearchRadiusKm(),
                        user.getId().toString());

                // Build detailed room info
                List<Map<String, Object>> roomDetails = new ArrayList<>();
                for (Room room : roomsInRadius) {
                    Map<String, Object> roomInfo = new HashMap<>();
                    roomInfo.put("id", room.getId());
                    roomInfo.put("title", room.getTitle());
                    roomInfo.put("priceMonth", room.getPrice_month());
                    roomInfo.put("area", room.getArea());
                    roomInfo.put("roomLength", room.getRoomLength());
                    roomInfo.put("roomWidth", room.getRoomWidth());
                    roomInfo.put("elecPrice", room.getElecPrice());
                    roomInfo.put("waterPrice", room.getWaterPrice());
                    roomInfo.put("maxPeople", room.getMaxPeople());
                    roomInfo.put("address", mlCalculationService.buildAddressString(room.getAddress()));

                    // Calculate distance
                    if (room.getAddress() != null && room.getAddress().getLat() != null
                            && room.getAddress().getLng() != null) {
                        double distance = mlCalculationService.calculateDistance(userAddress, room.getAddress());
                        roomInfo.put("distanceKm", Math.round(distance * 10.0) / 10.0); // Round to 1 decimal
                        roomInfo.put("coordinates", Map.of(
                                "lat", room.getAddress().getLat(),
                                "lng", room.getAddress().getLng()));
                    }

                    // Landlord info
                    if (room.getUser() != null && room.getUser().getProfile() != null) {
                        UserProfile profile = room.getUser().getProfile();
                        roomInfo.put("landlordName",
                                profile.getFullName() != null ? profile.getFullName() : room.getUser().getUsername());
                        roomInfo.put("landlordEmail", profile.getEmail());
                        roomInfo.put("landlordPhone", profile.getPhoneNumber());
                    }

                    roomDetails.add(roomInfo);
                }

                // Sort by distance
                roomDetails.sort((r1, r2) -> {
                    Double d1 = (Double) r1.get("distanceKm");
                    Double d2 = (Double) r2.get("distanceKm");
                    if (d1 == null)
                        d1 = Double.MAX_VALUE;
                    if (d2 == null)
                        d2 = Double.MAX_VALUE;
                    return Double.compare(d1, d2);
                });

                result.put("roomsInRadius", roomDetails);
                result.put("totalRooms", roomsInRadius.size());
                result.put("searchRadiusKm", mlCalculationService.getSearchRadiusKm());

                // Statistics
                if (!roomDetails.isEmpty()) {
                    List<Double> distances = roomDetails.stream()
                            .map(r -> (Double) r.get("distanceKm"))
                            .filter(d -> d != null)
                            .collect(Collectors.toList());

                    if (!distances.isEmpty()) {
                        result.put("distanceStats", Map.of(
                                "minDistance", distances.stream().mapToDouble(Double::doubleValue).min().orElse(0),
                                "maxDistance", distances.stream().mapToDouble(Double::doubleValue).max().orElse(0),
                                "avgDistance",
                                distances.stream().mapToDouble(Double::doubleValue).average().orElse(0)));
                    }
                }

            } else {
                result.put("userLocation", userLocation);
                result.put("hasValidCoordinates", false);
                result.put("error", "User has no valid coordinates for radius search");

                // Fallback: get basic available rooms
                List<Room> basicRooms = roomRepository.findAvailableRoomsForML(user.getId());
                result.put("fallbackRooms", basicRooms.size());
                result.put("message", "Using basic available rooms query instead of radius search");
            }
        } else {
            result.put("hasValidCoordinates", false);
            result.put("userLocation", null);
            result.put("error", "User has no address information");

            // Fallback: get basic available rooms
            List<Room> basicRooms = roomRepository.findAvailableRoomsForML(user.getId());
            result.put("fallbackRooms", basicRooms.size());
            result.put("message", "No user address found, using basic available rooms query");
        }

        return result;
    }

}
