package com.ants.ktc.ants_ktc.services;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.UUID;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.Semaphore;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.scheduling.annotation.Async;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.ants.ktc.ants_ktc.entities.Favorite;
import com.ants.ktc.ants_ktc.entities.Room;
import com.ants.ktc.ants_ktc.entities.User;
import com.ants.ktc.ants_ktc.repositories.FavoriteJpaRepository;
import com.ants.ktc.ants_ktc.repositories.RoomJpaRepository;
import com.ants.ktc.ants_ktc.dtos.room.RoomSuggestionInfoDto;

@Service
public class RoomSuggestionService {

    @Autowired
    private FavoriteJpaRepository favoriteJpaRepository;

    @Autowired
    private RoomJpaRepository roomJpaRepository;

    @Autowired
    private MailService mailService;

    // @Autowired
    // private GoogleMapsService googleMapsService;

    // Semaphore để giới hạn số lượng email gửi đồng thời (tránh spam)
    private final Semaphore emailSemaphore = new Semaphore(5); // Tối đa 5 email cùng lúc

    // @Scheduled(cron = "0 0 7 * * ?")
    // public void sendMorningSuggestions() {
    //     System.out.println("[RoomSuggestionService] Starting morning room suggestions at 7:00 AM");
    //     sendRoomSuggestionsToAllUsers();
    // }

    @Scheduled(cron = "0 0 19 * * ?")
    public void sendEveningSuggestions() {
        System.out.println("[RoomSuggestionService] Starting evening room suggestions at 7:00 PM");
        sendRoomSuggestionsToAllUsers();
    }

    @Transactional(readOnly = true)
    public void sendRoomSuggestionsToAllUsers() {
        try {
            // Lấy tất cả user có favorite rooms
            List<User> usersWithFavorites = favoriteJpaRepository.findUsersWithFavorites();
            System.out.println("[RoomSuggestionService] Found " + usersWithFavorites.size() + " users with favorites");

            List<CompletableFuture<Void>> futures = new ArrayList<>();

            for (User user : usersWithFavorites) {
                // Xử lý bất đồng bộ cho từng user để tránh block
                CompletableFuture<Void> future = processUserSuggestionAsync(user);
                futures.add(future);

                // Thêm delay nhỏ giữa các user để tránh quá tải
                try {
                    Thread.sleep(3000); // 3000ms delay
                } catch (InterruptedException e) {
                    Thread.currentThread().interrupt();
                    break;
                }
            }

            // Đợi tất cả hoàn thành
            CompletableFuture.allOf(futures.toArray(new CompletableFuture[0])).join();
            System.out.println("[RoomSuggestionService] Completed sending suggestions to all users");

        } catch (Exception e) {
            System.err.println("[RoomSuggestionService] Error in sendRoomSuggestionsToAllUsers: " + e.getMessage());
            e.printStackTrace();
        }
    }

    @Async
    public CompletableFuture<Void> processUserSuggestionAsync(User user) {
        try {
            // Acquire semaphore trước khi gửi email
            emailSemaphore.acquire();

            try {
                List<RoomSuggestionInfoDto> suggestions = findSuggestedRoomsForUser(user);

                if (!suggestions.isEmpty()) {
                    String userEmail = user.getProfile() != null ? user.getProfile().getEmail() : null;
                    String userName = user.getProfile() != null ? user.getProfile().getFullName() : user.getUsername();

                    if (userEmail != null && !userEmail.trim().isEmpty()) {
                        mailService.sendRoomSuggestionEmail(userEmail, userName, suggestions);
                        System.out.println(
                                "[RoomSuggestionService] Sent " + suggestions.size() + " suggestions to: " + userEmail);
                    }
                }
            } finally {
                // Release semaphore sau khi hoàn thành
                emailSemaphore.release();
            }

        } catch (Exception e) {
            System.err.println(
                    "[RoomSuggestionService] Error processing user " + user.getUsername() + ": " + e.getMessage());
            e.printStackTrace();
        }

        return CompletableFuture.completedFuture(null);
    }

    @Transactional(readOnly = true)
    public List<RoomSuggestionInfoDto> findSuggestedRoomsForUser(User user) {
        try {
            // Lấy danh sách phòng yêu thích của user
            List<Favorite> favorites = favoriteJpaRepository.findByUserIdWithRoom(user.getId(), Pageable.unpaged())
                    .getContent();

            if (favorites.isEmpty()) {
                System.out.println("[RoomSuggestionService] User " + user.getUsername() + " has no favorite rooms");
                return Collections.emptyList();
            }

            System.out.println("[RoomSuggestionService] User " + user.getUsername() + " has " + favorites.size()
                    + " favorite rooms");

            // In ra thông tin phòng yêu thích để debug
            for (Favorite fav : favorites) {
                Room favRoom = fav.getRoom();
                if (favRoom != null) {
                    String location = "";
                    if (favRoom.getAddress() != null && favRoom.getAddress().getWard() != null) {
                        location = favRoom.getAddress().getWard().getDistrict().getProvince().getName();
                    }
                    System.out.println("[RoomSuggestionService] Favorite room: " + favRoom.getTitle() +
                            ", Price: " + favRoom.getPrice_month() +
                            ", Area: " + favRoom.getArea() +
                            ", Location: " + location);
                }
            }

            // Phân tích pattern từ phòng yêu thích
            RoomCriteria criteria = analyzeFavoriteRoomsCriteria(favorites);

            // Tìm phòng phù hợp dựa trên criteria, loại trừ những phòng user đã yêu thích
            List<Room> suggestedRooms = findRoomsByCriteria(criteria, user.getId());

            System.out.println("[RoomSuggestionService] Found " + suggestedRooms.size() + " suggested rooms for user "
                    + user.getUsername());

            // Lấy địa chỉ của user để tính khoảng cách
            String userAddress = getUserAddress(user);

            // Convert sang RoomSuggestionInfo với tính khoảng cách
            return suggestedRooms.stream()
                    .map(room -> convertToSuggestionInfo(room, userAddress))
                    .collect(Collectors.toList());

        } catch (Exception e) {
            System.err.println("[RoomSuggestionService] Error finding suggestions for user " + user.getUsername() + ": "
                    + e.getMessage());
            e.printStackTrace();
            return Collections.emptyList();
        }
    }

    private RoomCriteria analyzeFavoriteRoomsCriteria(List<Favorite> favorites) {
        RoomCriteria criteria = new RoomCriteria();

        List<Double> prices = new ArrayList<>();
        List<Double> areas = new ArrayList<>();
        List<String> provinces = new ArrayList<>();
        List<String> districts = new ArrayList<>();
        List<String> wards = new ArrayList<>();

        for (Favorite favorite : favorites) {
            Room room = favorite.getRoom();
            if (room != null) {
                prices.add(room.getPrice_month());
                areas.add(room.getArea());

                if (room.getAddress() != null) {
                    if (room.getAddress().getWard() != null) {
                        wards.add(room.getAddress().getWard().getName());

                        if (room.getAddress().getWard().getDistrict() != null) {
                            districts.add(room.getAddress().getWard().getDistrict().getName());

                            if (room.getAddress().getWard().getDistrict().getProvince() != null) {
                                provinces.add(room.getAddress().getWard().getDistrict().getProvince().getName());
                            }
                        }
                    }
                }
            }
        }

        // Tính toán khoảng giá linh hoạt: ±1,000,000 VND từ trung bình (tăng từ ±300k)
        // Nếu giá trung bình thấp, sử dụng % để linh hoạt hơn
        if (!prices.isEmpty()) {
            double avgPrice = prices.stream().mapToDouble(Double::doubleValue).average().orElse(0);

            // Sử dụng khoảng linh hoạt: ±1 triệu hoặc ±50% (chọn giá trị lớn hơn)
            double priceRange = Math.max(1000000, avgPrice * 0.5);

            criteria.setMinPrice(Math.max(0, avgPrice - priceRange)); // Không âm
            criteria.setMaxPrice(avgPrice + priceRange);

            System.out.println("[RoomSuggestionService] Average price: " + avgPrice +
                    ", Price range (±" + priceRange + "): " + criteria.getMinPrice() + " - " + criteria.getMaxPrice());
        }

        // Tính toán khoảng diện tích linh hoạt: ±40% từ trung bình
        if (!areas.isEmpty()) {
            double avgArea = areas.stream().mapToDouble(Double::doubleValue).average().orElse(0);
            criteria.setMinArea(Math.max(5, avgArea * 0.6)); // Tối thiểu 5m²
            criteria.setMaxArea(avgArea * 1.4);

            System.out.println("[RoomSuggestionService] Average area: " + avgArea +
                    ", Area range: " + criteria.getMinArea() + " - " + criteria.getMaxArea());
        }

        // Ưu tiên địa chỉ theo thứ tự: cùng phường > cùng quận > cùng tỉnh
        criteria.setPreferredProvinces(getTopItems(provinces, 5)); // Tăng số lượng tỉnh
        criteria.setPreferredDistricts(getTopItems(districts, 8)); // Tăng số lượng quận
        criteria.setPreferredWards(getTopItems(wards, 10)); // Thêm phường

        System.out.println(
                "[RoomSuggestionService] Preferred locations - Provinces: " + criteria.getPreferredProvinces() +
                        ", Districts: " + criteria.getPreferredDistricts() +
                        ", Wards: " + criteria.getPreferredWards());

        // Debug: in ra tổng số địa danh để kiểm tra
        System.out.println(
                "[RoomSuggestionService] Total location items - Provinces: " + criteria.getPreferredProvinces().size() +
                        ", Districts: " + criteria.getPreferredDistricts().size() +
                        ", Wards: " + criteria.getPreferredWards().size());

        return criteria;
    }

    // Method để test với user cụ thể
    public void testSuggestionForUser(String username) {
        try {
            List<User> allUsers = favoriteJpaRepository.findUsersWithFavorites();
            User targetUser = allUsers.stream()
                    .filter(user -> user.getUsername().equals(username))
                    .findFirst()
                    .orElse(null);

            if (targetUser != null) {
                System.out.println("[RoomSuggestionService] Testing suggestion for user: " + username);
                List<RoomSuggestionInfoDto> suggestions = findSuggestedRoomsForUser(targetUser);

                if (!suggestions.isEmpty()) {
                    String userEmail = targetUser.getProfile() != null ? targetUser.getProfile().getEmail() : null;
                    String userName = targetUser.getProfile() != null ? targetUser.getProfile().getFullName()
                            : targetUser.getUsername();

                    if (userEmail != null && !userEmail.trim().isEmpty()) {
                        System.out.println("[RoomSuggestionService] Sending " + suggestions.size() + " suggestions to: "
                                + userEmail);
                        mailService.sendRoomSuggestionEmail(userEmail, userName, suggestions);
                    } else {
                        System.out.println("[RoomSuggestionService] User has no email address");
                    }
                } else {
                    System.out.println("[RoomSuggestionService] No suggestions found for user: " + username);
                }
            } else {
                System.out.println("[RoomSuggestionService] User not found or has no favorites: " + username);
            }
        } catch (Exception e) {
            System.err.println(
                    "[RoomSuggestionService] Error testing suggestion for user " + username + ": " + e.getMessage());
            e.printStackTrace();
        }
    }

    // Method debug để test query linh hoạt
    public void debugQueryForUser(String username) {
        try {
            List<User> allUsers = favoriteJpaRepository.findUsersWithFavorites();
            User targetUser = allUsers.stream()
                    .filter(user -> user.getUsername().equals(username))
                    .findFirst()
                    .orElse(null);

            if (targetUser != null) {
                System.out.println("[DEBUG] === DEBUGGING QUERY FOR USER: " + username + " ===");

                // 1. Test cơ bản: tìm tất cả phòng available
                System.out.println("[DEBUG] 1. Testing basic available rooms...");
                List<Room> allAvailableRooms = roomJpaRepository.findAll().stream()
                        .filter(r -> r.getAvailable() == 0 && r.getApproval() == 1 &&
                                r.getHidden() == 0 && r.getIsRemoved() == 0)
                        .limit(5)
                        .collect(Collectors.toList());
                System.out.println("[DEBUG] Found " + allAvailableRooms.size() + " available rooms total");

                // 2. Test từng criteria riêng biệt
                List<Favorite> favorites = favoriteJpaRepository
                        .findByUserIdWithRoom(targetUser.getId(), Pageable.unpaged()).getContent();
                if (!favorites.isEmpty()) {
                    RoomCriteria criteria = analyzeFavoriteRoomsCriteria(favorites);

                    System.out.println("[DEBUG] 2. Testing price criteria only...");
                    long priceMatches = allAvailableRooms.stream()
                            .filter(r -> r.getPrice_month() >= criteria.getMinPrice() &&
                                    r.getPrice_month() <= criteria.getMaxPrice())
                            .count();
                    System.out.println("[DEBUG] Rooms matching price: " + priceMatches);

                    System.out.println("[DEBUG] 3. Testing area criteria only...");
                    long areaMatches = allAvailableRooms.stream()
                            .filter(r -> r.getArea() >= criteria.getMinArea() &&
                                    r.getArea() <= criteria.getMaxArea())
                            .count();
                    System.out.println("[DEBUG] Rooms matching area: " + areaMatches);

                    System.out.println("[DEBUG] 4. Testing location criteria only...");
                    long locationMatches = allAvailableRooms.stream()
                            .filter(r -> {
                                if (r.getAddress() != null && r.getAddress().getWard() != null) {
                                    String province = r.getAddress().getWard().getDistrict().getProvince().getName();
                                    String district = r.getAddress().getWard().getDistrict().getName();
                                    String ward = r.getAddress().getWard().getName();

                                    return criteria.getPreferredProvinces().contains(province) ||
                                            criteria.getPreferredDistricts().contains(district) ||
                                            criteria.getPreferredWards().contains(ward);
                                }
                                return false;
                            })
                            .count();
                    System.out.println("[DEBUG] Rooms matching location: " + locationMatches);

                    System.out.println("[DEBUG] 5. Testing exclude favorites...");
                    List<UUID> favoriteRoomIds = favorites.stream()
                            .map(f -> f.getRoom().getId())
                            .collect(Collectors.toList());
                    System.out.println("[DEBUG] User has " + favoriteRoomIds.size() + " favorite rooms to exclude");
                }

            } else {
                System.out.println("[DEBUG] User not found: " + username);
            }
        } catch (Exception e) {
            System.err.println("[DEBUG] Error in debug query: " + e.getMessage());
            e.printStackTrace();
        }
    }

    private List<String> getTopItems(List<String> items, int limit) {
        return items.stream()
                .collect(Collectors.groupingBy(item -> item, Collectors.counting()))
                .entrySet().stream()
                .sorted((e1, e2) -> Long.compare(e2.getValue(), e1.getValue()))
                .limit(limit)
                .map(entry -> entry.getKey())
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<Room> findRoomsByCriteria(RoomCriteria criteria, UUID excludeUserId) {
        try {
            Pageable pageable = PageRequest.of(0, 15); // Tăng từ 10 lên 15 phòng gợi ý

            System.out.println("[RoomSuggestionService] === QUERY DEBUG INFO ===");
            System.out.println("[RoomSuggestionService] User ID to exclude: " + excludeUserId);
            System.out.println(
                    "[RoomSuggestionService] Price range (MAIN CRITERIA): " + criteria.getMinPrice() + " - "
                            + criteria.getMaxPrice());
            System.out.println(
                    "[RoomSuggestionService] Area range (SORTING ONLY): " + criteria.getMinArea() + " - "
                            + criteria.getMaxArea());
            System.out
                    .println("[RoomSuggestionService] Provinces (MAIN CRITERIA): " + criteria.getPreferredProvinces());
            System.out
                    .println("[RoomSuggestionService] Districts (SORTING ONLY): " + criteria.getPreferredDistricts());
            System.out.println("[RoomSuggestionService] Wards (SORTING ONLY): " + criteria.getPreferredWards());
            System.out.println(
                    "[RoomSuggestionService] NOTE: Only price and province are used for filtering. Districts, wards and area are only used for sorting preference.");

            // Xử lý empty lists để tránh lỗi SQL
            List<String> provinces = criteria.getPreferredProvinces().isEmpty() ? List.of("__NO_PROVINCE_MATCH__")
                    : criteria.getPreferredProvinces();
            List<String> districts = criteria.getPreferredDistricts().isEmpty() ? List.of("__NO_DISTRICT_MATCH__")
                    : criteria.getPreferredDistricts();
            List<String> wards = criteria.getPreferredWards().isEmpty() ? List.of("__NO_WARD_MATCH__")
                    : criteria.getPreferredWards();

            List<Room> results = roomJpaRepository.findSuggestedRoomsFlexible(
                    criteria.getMinPrice(),
                    criteria.getMaxPrice(),
                    criteria.getMinArea(),
                    criteria.getMaxArea(),
                    provinces,
                    districts,
                    wards,
                    excludeUserId,
                    pageable);

            System.out.println(
                    "[RoomSuggestionService] Query returned " + results.size() + " rooms for user " + excludeUserId);

            if (results.isEmpty()) {
                System.out.println("[RoomSuggestionService] === NO RESULTS - POSSIBLE REASONS ===");
                System.out.println("[RoomSuggestionService] 1. No rooms with price between " + criteria.getMinPrice()
                        + " - " + criteria.getMaxPrice());
                System.out.println("[RoomSuggestionService] 2. No rooms in specified provinces: "
                        + criteria.getPreferredProvinces());
                System.out.println("[RoomSuggestionService] 3. All matching rooms are already in user's favorites");
                System.out.println(
                        "[RoomSuggestionService] 4. No rooms with available=0, approval=1, hidden=0, isRemoved=0");
                System.out
                        .println(
                                "[RoomSuggestionService] NOTE: Only province match is required. Districts, wards and area are used for sorting only");
            }

            // Log một số phòng suggest để debug
            for (int i = 0; i < Math.min(3, results.size()); i++) {
                Room room = results.get(i);
                String location = "";
                if (room.getAddress() != null && room.getAddress().getWard() != null) {
                    location = room.getAddress().getWard().getDistrict().getProvince().getName();
                }
                System.out.println("[RoomSuggestionService] Suggested room " + (i + 1) + ": " + room.getTitle() +
                        ", Price: " + room.getPrice_month() +
                        ", Area: " + room.getArea() +
                        ", Location: " + location);
            }

            return results;

        } catch (Exception e) {
            System.err.println("[RoomSuggestionService] Error finding rooms by criteria: " + e.getMessage());
            e.printStackTrace();
            return Collections.emptyList();
        }
    }

    private RoomSuggestionInfoDto convertToSuggestionInfo(Room room, String userAddress) {
        String address = "";
        String landlordName = "";
        String landlordEmail = "";
        String landlordPhone = "";
        Double distanceKm = null;

        if (room.getAddress() != null) {
            StringBuilder addressBuilder = new StringBuilder();
            addressBuilder.append(room.getAddress().getStreet() != null ? room.getAddress().getStreet() : "");

            if (room.getAddress().getWard() != null) {
                addressBuilder.append(", ").append(room.getAddress().getWard().getName());

                if (room.getAddress().getWard().getDistrict() != null) {
                    addressBuilder.append(", ").append(room.getAddress().getWard().getDistrict().getName());

                    if (room.getAddress().getWard().getDistrict().getProvince() != null) {
                        addressBuilder.append(", ")
                                .append(room.getAddress().getWard().getDistrict().getProvince().getName());
                    }
                }
            }
            address = addressBuilder.toString();
        }

        if (room.getUser() != null && room.getUser().getProfile() != null) {
            landlordName = room.getUser().getProfile().getFullName() != null ? room.getUser().getProfile().getFullName()
                    : room.getUser().getUsername();
            landlordEmail = room.getUser().getProfile().getEmail();
            landlordPhone = room.getUser().getProfile().getPhoneNumber();
        }

        // Tính khoảng cách nếu user có địa chỉ và phòng có địa chỉ
        if (userAddress != null && !userAddress.trim().isEmpty() &&
                address != null && !address.trim().isEmpty()) {
            try {
                // long distanceMeters = googleMapsService.getDistance(userAddress, address);
                // distanceKm = distanceMeters / 1000.0; // Chuyển từ meters sang km
                // System.out.println("[RoomSuggestionService] Distance from user to room '" + room.getTitle() + "': " +
                        // String.format("%.2f", distanceKm) + " km");
            } catch (Exception e) {
                System.out.println("[RoomSuggestionService] Could not calculate distance to room '" + room.getTitle()
                        + "': " + e.getMessage());
                distanceKm = null; // Không tính được khoảng cách
            }
        }

        return new RoomSuggestionInfoDto(
                room.getTitle(),
                room.getPrice_month(),
                room.getArea(),
                address,
                room.getDescription(),
                landlordName,
                landlordEmail,
                landlordPhone
                // distanceKm
                );
    }

    // Inner class để chứa criteria tìm kiếm
    private static class RoomCriteria {
        private Double minPrice;
        private Double maxPrice;
        private Double minArea;
        private Double maxArea;
        private List<String> preferredProvinces = new ArrayList<>();
        private List<String> preferredDistricts = new ArrayList<>();
        private List<String> preferredWards = new ArrayList<>();

        // Getters and Setters
        public Double getMinPrice() {
            return minPrice;
        }

        public void setMinPrice(Double minPrice) {
            this.minPrice = minPrice;
        }

        public Double getMaxPrice() {
            return maxPrice;
        }

        public void setMaxPrice(Double maxPrice) {
            this.maxPrice = maxPrice;
        }

        public Double getMinArea() {
            return minArea;
        }

        public void setMinArea(Double minArea) {
            this.minArea = minArea;
        }

        public Double getMaxArea() {
            return maxArea;
        }

        public void setMaxArea(Double maxArea) {
            this.maxArea = maxArea;
        }

        public List<String> getPreferredProvinces() {
            return preferredProvinces;
        }

        public void setPreferredProvinces(List<String> preferredProvinces) {
            this.preferredProvinces = preferredProvinces;
        }

        public List<String> getPreferredDistricts() {
            return preferredDistricts;
        }

        public void setPreferredDistricts(List<String> preferredDistricts) {
            this.preferredDistricts = preferredDistricts;
        }

        public List<String> getPreferredWards() {
            return preferredWards;
        }

        public void setPreferredWards(List<String> preferredWards) {
            this.preferredWards = preferredWards;
        }
    }

    // Method để lấy địa chỉ của user từ profile
    private String getUserAddress(User user) {
        if (user.getProfile() == null) {
            System.out.println("[RoomSuggestionService] User " + user.getUsername() + " has no profile");
            return null;
        }

        if (user.getProfile().getAddress() == null) {
            System.out.println("[RoomSuggestionService] User " + user.getUsername() + " has no address in profile");
            return null;
        }

        // Build địa chỉ từ Address entity
        StringBuilder addressBuilder = new StringBuilder();
        com.ants.ktc.ants_ktc.entities.address.Address address = user.getProfile().getAddress();

        if (address.getStreet() != null && !address.getStreet().trim().isEmpty()) {
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

        String fullAddress = addressBuilder.toString();
        if (fullAddress.trim().isEmpty()) {
            System.out.println("[RoomSuggestionService] User " + user.getUsername() + " has empty address");
            return null;
        }

        System.out.println("[RoomSuggestionService] User " + user.getUsername() + " address: " + fullAddress);
        return fullAddress;
    }
}
