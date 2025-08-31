package com.ants.ktc.ants_ktc.services;

import java.io.IOException;
import java.util.Map;
import java.util.Objects;
import java.util.Optional;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import com.ants.ktc.ants_ktc.dtos.address.AddressResponseDto;
import com.ants.ktc.ants_ktc.dtos.address.DistrictResponseDto;
import com.ants.ktc.ants_ktc.dtos.address.ProvinceResponseDto;
import com.ants.ktc.ants_ktc.dtos.address.WardResponseDto;
import com.ants.ktc.ants_ktc.dtos.user.UserNameResponseDto;
import com.ants.ktc.ants_ktc.dtos.userprofile.ProfileUpdateRequestDto;
import com.ants.ktc.ants_ktc.dtos.userprofile.UserPreferencesUpdateDto;
import com.ants.ktc.ants_ktc.dtos.userprofile.UserProfileResponseDto;
import com.ants.ktc.ants_ktc.entities.User;
import com.ants.ktc.ants_ktc.entities.UserProfile;
import com.ants.ktc.ants_ktc.entities.address.Address;
import com.ants.ktc.ants_ktc.entities.address.Ward;
import com.ants.ktc.ants_ktc.repositories.ProfileJpaRepository;
import com.ants.ktc.ants_ktc.repositories.UserJpaRepository;
import com.ants.ktc.ants_ktc.repositories.address.WardJpaRepository;
import com.ants.ktc.ants_ktc.repositories.projection.UserProfileProjection;

@Service
public class ProfileService {

        @Autowired
        private LocationIQService locationIQService;

        @Autowired
        private ProfileJpaRepository profileJpaRepository;

        @Autowired
        private WardJpaRepository wardRepository;

        @Autowired
        private CloudinaryService cloudinaryService;

        @Autowired
        private UserJpaRepository userJpaRepository;

        private AddressResponseDto addressConvert(Address address) {
                if (address == null)
                        return null;
                Ward ward = address.getWard();
                WardResponseDto wardDto = null;
                if (ward != null) {
                        wardDto = WardResponseDto.builder()
                                        .id(ward.getId())
                                        .name(ward.getName())
                                        .district(DistrictResponseDto.builder()
                                                        .id(ward.getDistrict().getId())
                                                        .name(ward.getDistrict().getName())
                                                        .province(ProvinceResponseDto.builder()
                                                                        .id(ward.getDistrict().getProvince().getId())
                                                                        .name(ward.getDistrict().getProvince()
                                                                                        .getName())
                                                                        .build())
                                                        .build())
                                        .build();
                }
                return AddressResponseDto.builder()
                                .id(address.getId())
                                .street(address.getStreet())
                                .ward(wardDto)
                                .build();
        }

        public Optional<UserNameResponseDto> getFullNameById(UUID id) {
                Optional<UserProfileProjection> projection = userJpaRepository.findFullNameById(id);
                return projection.map(p -> {
                        UserNameResponseDto responseDto = new UserNameResponseDto();
                        responseDto.setUserId(p.getId());
                        responseDto.setFullName(p.getFullName());
                        responseDto.setAvatar(p.getAvatar());
                        return responseDto;
                });
        }

        private String removePrefix(String text, String prefix) {
                if (text == null)
                        return null;
                if (text.startsWith(prefix)) {
                        return text.substring(prefix.length()).trim();
                }
                return text;
        }

        public UserProfileResponseDto updateProfile(MultipartFile avatar, ProfileUpdateRequestDto dto)
                        throws IOException {

                UserProfile profile = profileJpaRepository.findById(dto.getId())
                                .orElseThrow(() -> new IllegalArgumentException("Profile not found"));

                if (avatar != null && !avatar.isEmpty()) {
                        try {
                                // Upload ảnh lên Cloudinary
                                Map<String, String> uploadResult = cloudinaryService.uploadFile(avatar);
                                String avatarUrl = uploadResult.get("url");
                                profile.setAvatar(avatarUrl); // cập nhật avatar cho profile
                        } catch (Exception e) {
                                throw new RuntimeException("Failed to upload avatar: " + e.getMessage(), e);
                        }

                        // code cũ
                        // String fileName = System.currentTimeMillis() + "_" +
                        // avatar.getOriginalFilename();
                        // Path filePath = Paths.get("public/uploads/" + fileName);
                        // Files.createDirectories(filePath.getParent());
                        // Files.write(filePath, avatar.getBytes());

                        // String avatarUrl = "/uploads/" + fileName;
                        // profile.setAvatar(avatarUrl); // cập nhật avatar cho profile
                }

                profile.setId(dto.getId());
                profile.setFullName(dto.getFullName());
                // Kiểm tra email đã tồn tại cho user khác chưa
                if (dto.getEmail() != null && !dto.getEmail().equals(profile.getEmail())) {
                        boolean emailExists = profileJpaRepository.existsByEmailAndIdNot(dto.getEmail(),
                                        profile.getId());
                        if (emailExists) {
                                throw new IllegalArgumentException("Email already exists");
                        }
                        profile.setEmail(dto.getEmail());
                }

                // Kiểm tra phoneNumber đã tồn tại cho user khác chưa
                if (dto.getPhoneNumber() != null && !dto.getPhoneNumber().equals(profile.getPhoneNumber())) {
                        boolean phoneExists = profileJpaRepository.existsByPhoneNumberAndIdNot(dto.getPhoneNumber(),
                                        profile.getId());
                        if (phoneExists) {
                                throw new IllegalArgumentException("Phone number already exists");
                        }
                        profile.setPhoneNumber(dto.getPhoneNumber());
                }
                if (dto.getBankName() != null) {
                        profile.setBankName(dto.getBankName());
                }
                if (dto.getBinCode() != null) {
                        profile.setBinCode(dto.getBinCode());
                }
                if (dto.getBankNumber() != null) {
                        profile.setBankNumber(dto.getBankNumber());
                }
                if (dto.getAccoutHolderName() != null) {
                        profile.setAccoutHolderName(dto.getAccoutHolderName());
                }

                AddressResponseDto addressDto = null;
                if (dto.getAddress() != null && dto.getAddress().getWardId() != null) {
                        Address address = profile.getAddress();
                        if (address == null) {
                                address = new Address();
                                profile.setAddress(address);
                        }
                        address.setStreet(dto.getAddress().getStreet());
                        // Lấy ward từ DB
                        Ward ward = wardRepository.findById(dto.getAddress().getWardId())
                                        .orElseThrow(() -> new RuntimeException("Ward Not Found"));
                        address.setWard(ward);

                        String fullAddress = dto.getAddress().getStreet() + ", " +
                                        removePrefix(ward.getName(), "Phường") + ", " +
                                        removePrefix(ward.getDistrict().getName(), "Quận") + ", " +
                                        removePrefix(ward.getDistrict().getProvince().getName(), "Thành phố");
                        try {
                                LocationIQService.LatLng latLng = locationIQService.getCoordinates(fullAddress);

                                if (latLng != null) {
                                        address.setLng(latLng.lng);
                                        address.setLat(latLng.lat);
                                }

                                profileJpaRepository.save(profile);
                                addressDto = addressConvert(address);
                        } catch (Exception e) {
                                throw new RuntimeException("Failed to get coordinates: " + e.getMessage(), e);
                        }
                } else {
                        profileJpaRepository.save(profile);
                        Address address = profile.getAddress();
                        addressDto = addressConvert(address);
                }
                return UserProfileResponseDto.builder()
                                .id(profile.getId())
                                .fullName(profile.getFullName())
                                .email(profile.getEmail())
                                .phoneNumber(profile.getPhoneNumber())
                                .avatar(profile.getAvatar())
                                .bankName(profile.getBankName())
                                .binCode(profile.getBinCode())
                                .bankNumber(profile.getBankNumber())
                                .accoutHolderName(profile.getAccoutHolderName())
                                .address(addressDto)
                                .build();
        }

        public UserProfileResponseDto getProfile(UUID id) {
                UserProfile profile = profileJpaRepository.findById(id)
                                .orElseThrow(() -> new IllegalArgumentException("Profile not found"));

                Address address = profile.getAddress();
                AddressResponseDto addressDto = addressConvert(address);
                return UserProfileResponseDto.builder()
                                .id(profile.getId())
                                .fullName(profile.getFullName())
                                .email(profile.getEmail())
                                .phoneNumber(profile.getPhoneNumber())
                                .avatar(profile.getAvatar())
                                .bankName(profile.getBankName())
                                .binCode(profile.getBinCode())
                                .bankNumber(profile.getBankNumber())
                                .accoutHolderName(profile.getAccoutHolderName())
                                .address(addressDto)
                                .build();
        }

        /**
         * Cập nhật preferences của user (địa chỉ tìm kiếm và giá mong muốn)
         */
        public void updateUserPreferences(UUID userId, UserPreferencesUpdateDto dto) {
                User user = userJpaRepository.findById(userId)
                                .orElseThrow(() -> new IllegalArgumentException("User not found: " + userId));
                UserProfile profile = user.getProfile();

                // Cập nhật địa chỉ tìm kiếm
                String oldSearchAddress = profile.getSearchAddress();
                profile.setSearchAddress(dto.getSearchAddress());

                // Nếu địa chỉ thay đổi, geocode để lấy tọa độ
                if (!Objects.equals(oldSearchAddress, dto.getSearchAddress())) {
                        if (dto.getSearchAddress() != null && !dto.getSearchAddress().trim().isEmpty()) {
                                try {
                                        LocationIQService.LatLng coordinates = locationIQService
                                                        .getCoordinates(dto.getSearchAddress());
                                        profile.setSearchLatitude(coordinates.lat);
                                        profile.setSearchLongitude(coordinates.lng);
                                        System.out.println("Successfully geocoded address using LocationIQ: "
                                                        + dto.getSearchAddress() +
                                                        " -> Lat: " + coordinates.lat + ", Lng: " + coordinates.lng);

                                } catch (Exception e) {
                                        // Nếu không geocode được, set null và log lỗi
                                        profile.setSearchLatitude(null);
                                        profile.setSearchLongitude(null);

                                        System.err.println("Failed to geocode address using LocationIQ: "
                                                        + dto.getSearchAddress() +
                                                        ". Error: " + e.getMessage());

                                        // Kiểm tra nếu là lỗi API key của LocationIQ
                                        if (e.getMessage().contains("401") || e.getMessage().contains("API key")) {
                                                System.err.println(
                                                                "LocationIQ API key invalid or missing. Address will be saved without coordinates.");
                                                System.err.println(
                                                                "To fix this, please check your LOCATIONIQ_API_KEY in environment variables.");
                                        }

                                }
                        } else {
                                // Nếu địa chỉ rỗng, reset tọa độ
                                profile.setSearchLatitude(null);
                                profile.setSearchLongitude(null);
                        }
                }

                profileJpaRepository.save(profile);
        }

        // get search address from user profile
        public String getSearchAddress(UUID userId) {
                UserProfile profile = profileJpaRepository.findByUserId(userId)
                                .orElseThrow(() -> new IllegalArgumentException(
                                                "Profile not found for user: " + userId));
                return profile.getSearchAddress();
        }

        // Set email notifications
        public void setEmailNotifications(UUID userId, boolean enabled) {
                UserProfile profile = profileJpaRepository.findByUserId(userId)
                                .orElseThrow(() -> new IllegalArgumentException(
                                                "Profile not found for user: " + userId));
                profile.setEmailNotifications(enabled);
                profileJpaRepository.save(profile);
        }

        // get email notifications
        public boolean getEmailNotifications(UUID userId) {
                UserProfile profile = profileJpaRepository.findByUserId(userId)
                                .orElseThrow(() -> new IllegalArgumentException(
                                                "Profile not found for user: " + userId));
                return profile.isEmailNotifications();
        }

        /**
         * Lấy UserProfile entity (không phải DTO) để tính toán trong các service khác
         */
        public UserProfile getUserProfileEntity(UUID userId) {
                return profileJpaRepository.findByUserId(userId)
                                .orElseThrow(() -> new IllegalArgumentException(
                                                "Profile not found for user: " + userId));
        }

        /**
         * Tính khoảng cách từ user preferences đến địa chỉ của room (theo tọa độ)
         * 
         * @return Khoảng cách tính bằng km, hoặc Double.MAX_VALUE nếu không tính được
         */
        public double calculateDistanceToRoom(Double userLatitude, Double userLongitude, String roomAddressString) {
                if (userLatitude == null || userLongitude == null ||
                                roomAddressString == null || roomAddressString.trim().isEmpty()) {
                        return Double.MAX_VALUE;
                }

                try {
                        // Tạo user address từ coordinates
                        LocationIQService.LatLng roomCoordinates = locationIQService.getCoordinates(roomAddressString);

                        // Tính khoảng cách Haversine giữa 2 điểm
                        return calculateHaversineDistance(userLatitude, userLongitude,
                                        roomCoordinates.lat, roomCoordinates.lng);

                } catch (Exception e) {
                        // Log nhưng không in ra console để tránh spam log
                        if (!e.getMessage().contains("401") && !e.getMessage().contains("403") &&
                                        !e.getMessage().contains("access token")) {
                                System.err.println(
                                                "Failed to calculate distance to room address: " + roomAddressString +
                                                                ". Error: " + e.getMessage());
                        }
                        return Double.MAX_VALUE;
                }
        }

        /**
         * Tính điểm tương đồng địa chỉ kết hợp cả tọa độ và text matching
         * 
         * @param userProfile       UserProfile của user (chứa searchAddress,
         *                          searchLatitude, searchLongitude)
         * @param roomAddressString Địa chỉ đầy đủ của room
         * @return Điểm từ 0-100, càng cao càng phù hợp
         */
        public int calculateLocationScore(UserProfile userProfile, String roomAddressString) {
                if (userProfile == null || roomAddressString == null) {
                        return 0;
                }

                // Nếu có tọa độ của user, ưu tiên sử dụng distance-based scoring
                if (userProfile.getSearchLatitude() != null && userProfile.getSearchLongitude() != null) {
                        double distance = calculateDistanceToRoom(userProfile.getSearchLatitude(),
                                        userProfile.getSearchLongitude(), roomAddressString);

                        if (distance != Double.MAX_VALUE) {
                                // Convert distance to score: càng gần càng điểm cao
                                if (distance <= 1.0)
                                        return 100; // Trong vòng 1km
                                if (distance <= 5.0)
                                        return 80; // Trong vòng 5km
                                if (distance <= 10.0)
                                        return 60; // Trong vòng 10km
                                if (distance <= 20.0)
                                        return 40; // Trong vòng 20km
                                if (distance <= 50.0)
                                        return 20; // Trong vòng 50km
                                return 10; // Xa hơn 50km
                        }
                }

                // Fallback: sử dụng text matching
                return calculateAddressSimilarityScore(userProfile.getSearchAddress(), roomAddressString);
        }

        /**
         * Tính khoảng cách Haversine giữa 2 điểm tọa độ
         * 
         * @return Khoảng cách tính bằng km
         */
        private double calculateHaversineDistance(double lat1, double lon1, double lat2, double lon2) {
                final int R = 6371; // Bán kính Trái Đất tính bằng km

                double latDistance = Math.toRadians(lat2 - lat1);
                double lonDistance = Math.toRadians(lon2 - lon1);
                double a = Math.sin(latDistance / 2) * Math.sin(latDistance / 2)
                                + Math.cos(Math.toRadians(lat1)) * Math.cos(Math.toRadians(lat2))
                                                * Math.sin(lonDistance / 2) * Math.sin(lonDistance / 2);
                double c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
                return R * c;
        }

        /**
         * Tính điểm tương đồng địa chỉ dựa trên text matching (fallback khi không có
         * tọa độ)
         * 
         * @param userSearchAddress Địa chỉ tìm kiếm của user
         * @param roomAddressString Địa chỉ của room
         * @return Điểm tương đồng từ 0-100, cao hơn = giống hơn
         */
        public int calculateAddressSimilarityScore(String userSearchAddress, String roomAddressString) {
                if (userSearchAddress == null || roomAddressString == null) {
                        return 0;
                }

                String userAddr = userSearchAddress.toLowerCase().trim();
                String roomAddr = roomAddressString.toLowerCase().trim();

                // Exact match
                if (roomAddr.contains(userAddr) || userAddr.contains(roomAddr)) {
                        return 100;
                }

                // Partial matches - tách từ và đếm số từ giống nhau
                String[] userWords = userAddr.split("[,\\s]+");
                String[] roomWords = roomAddr.split("[,\\s]+");

                int matchCount = 0;
                int totalWords = userWords.length;

                for (String userWord : userWords) {
                        if (userWord.trim().length() > 2) { // Bỏ qua từ quá ngắn
                                for (String roomWord : roomWords) {
                                        if (roomWord.trim().toLowerCase().contains(userWord.trim()) ||
                                                        userWord.trim().contains(roomWord.trim().toLowerCase())) {
                                                matchCount++;
                                                break;
                                        }
                                }
                        }
                }

                // Tính điểm dựa trên tỷ lệ từ khớp
                return totalWords > 0 ? Math.min(100, (matchCount * 100) / totalWords) : 0;
        }

        public boolean isHaveBankAccount(UUID userId) {
                User user = userJpaRepository.findById(userId)
                                .orElseThrow(() -> new IllegalArgumentException("User not found: " + userId));
                UserProfile profile = user.getProfile();
                return profile != null && profile.getBankNumber() != null && !profile.getBankNumber().isEmpty();

        }

        /**
         * Tính khoảng cách đường đi thực tế giữa user và room sử dụng Mapbox Directions
         * API
         * 
         * @param userLatitude      Vĩ độ của user
         * @param userLongitude     Kinh độ của user
         * @param roomAddressString Địa chỉ của room
         * @return Khoảng cách đường đi tính bằng km, hoặc Double.MAX_VALUE nếu không
         *         tính được
         */
        public double calculateRealDistanceToRoom(Double userLatitude, Double userLongitude, String roomAddressString) {
                if (userLatitude == null || userLongitude == null ||
                                roomAddressString == null || roomAddressString.trim().isEmpty()) {
                        return Double.MAX_VALUE;
                }

                try {
                        // Tạo user address từ coordinates
                        String userAddress = userLatitude + "," + userLongitude;

                        // Sử dụng LocationIQ Directions API để tính khoảng cách đường đi thực tế
                        long distanceInMeters = locationIQService.getDistance(userAddress, roomAddressString);
                        // Convert sang km
                        return distanceInMeters / 1000.0;

                } catch (Exception e) {
                        // Fallback to Haversine distance if Directions API fails
                        try {
                                LocationIQService.LatLng roomCoordinates = locationIQService
                                                .getCoordinates(roomAddressString);
                                return calculateHaversineDistance(userLatitude, userLongitude,
                                                roomCoordinates.lat, roomCoordinates.lng);

                        } catch (Exception e2) {
                                if (!e2.getMessage().contains("401") && !e2.getMessage().contains("403") &&
                                                !e2.getMessage().contains("access token")) {
                                        System.err.println("Failed to calculate any distance to room address: "
                                                        + roomAddressString + ". Error: " + e2.getMessage());
                                }
                                return Double.MAX_VALUE;
                        }
                }
        }
}
