package com.ants.ktc.ants_ktc.services;

import java.io.FileOutputStream;
import java.io.InputStream;
import java.net.URI;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Random;
import java.util.UUID;

import org.apache.tomcat.util.http.fileupload.IOUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import com.ants.ktc.ants_ktc.dtos.address.AddressResponseDto;
import com.ants.ktc.ants_ktc.dtos.address.DistrictResponseDto;
import com.ants.ktc.ants_ktc.dtos.address.ProvinceResponseDto;
import com.ants.ktc.ants_ktc.dtos.address.WardResponseDto;
import com.ants.ktc.ants_ktc.dtos.auth.GoogleLoginRequestDto;
import com.ants.ktc.ants_ktc.dtos.auth.LoginRequestDto;
import com.ants.ktc.ants_ktc.dtos.auth.LoginResponseDto;
import com.ants.ktc.ants_ktc.dtos.auth.RegisterRequestDto;
import com.ants.ktc.ants_ktc.dtos.auth.RegisterResponseDto;
import com.ants.ktc.ants_ktc.dtos.user.LandlordResponseByRoomDto;
import com.ants.ktc.ants_ktc.dtos.userprofile.UserProfileResponseDto;
import com.ants.ktc.ants_ktc.entities.Role;
import com.ants.ktc.ants_ktc.entities.User;
import com.ants.ktc.ants_ktc.entities.UserProfile;
import com.ants.ktc.ants_ktc.entities.address.Address;
import com.ants.ktc.ants_ktc.entities.address.District;
import com.ants.ktc.ants_ktc.entities.address.Province;
import com.ants.ktc.ants_ktc.entities.address.Ward;
import com.ants.ktc.ants_ktc.exceptions.HttpException;
import com.ants.ktc.ants_ktc.repositories.ProfileJpaRepository;
import com.ants.ktc.ants_ktc.repositories.RoleJpaRepository;
import com.ants.ktc.ants_ktc.repositories.UserJpaRepository;
import com.ants.ktc.ants_ktc.repositories.projection.LandLordProjectionByRoom;
import com.ants.ktc.ants_ktc.services.auth.JwtService;

import jakarta.transaction.Transactional;

@Service
public class UserService {
        @Autowired
        private UserJpaRepository userJpaRepository;

        @Autowired
        private JwtService jwtService;

        @Autowired
        private RoleJpaRepository roleJpaRepository;

        @Autowired
        private ProfileJpaRepository profileJpaRepository;

        @Autowired
        private PasswordEncoder passwordEncoder;

        @Autowired
        private MailService mailService;

        @Autowired
        private CloudinaryService cloudinaryService;

        private final RestTemplate restTemplate = new RestTemplate();

        // ...existing code...



        private AddressResponseDto convertAddressDto(Address address) {
                if (address == null || address.getWard() == null)
                        return null;

                Ward ward = address.getWard();
                District district = ward.getDistrict();
                Province province = district.getProvince();

                ProvinceResponseDto provinceDto = ProvinceResponseDto.builder()
                                .id(province.getId())
                                .name(province.getName())
                                .build();

                DistrictResponseDto districtDto = DistrictResponseDto.builder()
                                .id(district.getId())
                                .name(district.getName())
                                .province(provinceDto)
                                .build();

                WardResponseDto wardDto = WardResponseDto.builder()
                                .id(ward.getId())
                                .name(ward.getName())
                                .district(districtDto)
                                .build();

                return AddressResponseDto.builder()
                                .id(address.getId())
                                .street(address.getStreet())
                                .ward(wardDto)
                                .build();
        }

        public LoginResponseDto login(LoginRequestDto request) throws Exception {
                User user = this.userJpaRepository.findByUsername(request.getUsername())
                                .orElseThrow(() -> new HttpException("Invalid username or password",
                                                HttpStatus.UNAUTHORIZED));

                if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
                        throw new HttpException("Invalid username or password", HttpStatus.UNAUTHORIZED);
                }

                if (user.getIsActive() == 1) {
                        throw new HttpException("Your account is not active. Please contact support.",
                                        HttpStatus.FORBIDDEN);
                }

                String accessToken = jwtService.generateAccessToken(user);
                String refreshToken = jwtService.generateRefreshToken(user);

                UserProfileResponseDto userProfileDto = null;
                AddressResponseDto addressDto = null;

                if (user.getProfile() != null) {
                        if (user.getProfile().getAddress() != null
                                        && user.getProfile().getAddress().getWard() != null) {
                                addressDto = convertAddressDto(user.getProfile().getAddress());
                        }

                        userProfileDto = UserProfileResponseDto.builder()
                                        .id(user.getProfile().getId())
                                        .fullName(user.getProfile().getFullName())
                                        .email(user.getProfile().getEmail())
                                        .phoneNumber(user.getProfile().getPhoneNumber())
                                        .avatar(user.getProfile().getAvatar())
                                        .bankName(user.getProfile().getBankName())
                                        .bankNumber(user.getProfile().getBankNumber())
                                        .binCode(user.getProfile().getBinCode())
                                        .accoutHolderName(user.getProfile().getAccoutHolderName())
                                        .address(addressDto)
                                        .build();
                }

                return LoginResponseDto.builder()
                                .id(user.getId())
                                .username(user.getUsername())
                                .userProfile(userProfileDto)
                                .roles(user.getRoles() != null
                                                ? user.getRoles().stream().map(Role::getName).toList()
                                                : null)
                                .accessToken(accessToken)
                                .refreshToken(refreshToken)
                                .build();
        }

        @CacheEvict(value = "manage-accounts", allEntries = true)
        public LoginResponseDto googleLogin(GoogleLoginRequestDto requestDto) {
                String credential = requestDto.getCredential();
                String url = "https://oauth2.googleapis.com/tokeninfo?id_token=" + credential;
                @SuppressWarnings("rawtypes")
                ResponseEntity<Map> response = restTemplate.getForEntity(url, Map.class);
                @SuppressWarnings("unchecked")
                Map<String, Object> payload = response.getBody();
                if (response.getStatusCode() != HttpStatus.OK) {
                        throw new HttpException("Invalid Google token", HttpStatus.UNAUTHORIZED);
                }

                String email;
                if (payload != null && payload.containsKey("email")) {
                        email = payload.get("email").toString();
                } else {
                        throw new HttpException("Email not found in token", HttpStatus.UNAUTHORIZED);
                }

                String iss = payload.get("iss").toString();
                if (!iss.equals("https://accounts.google.com") && !iss.equals("accounts.google.com")) {
                        throw new HttpException("Invalid Google token issuer", HttpStatus.UNAUTHORIZED);
                }

                long exp = Long.parseLong(payload.get("exp").toString());
                if (exp < System.currentTimeMillis() / 1000) {
                        throw new HttpException("Google token has expired", HttpStatus.UNAUTHORIZED);
                }

                User user = userJpaRepository.findByEmail(email);

                if (user == null) {
                        UserProfile existingProfile = profileJpaRepository.findByEmail(email).orElse(null);
                        if (existingProfile != null) {
                                throw new HttpException(
                                                "Email already exists with username "
                                                                + existingProfile.getUser().getUsername(),
                                                HttpStatus.CONFLICT);
                        }

                        user = new User();
                        user.setUsername(email);
                        user.setIsActive(0);
                        UserProfile profile = new UserProfile();

                        profile.setEmail(email);
                        profile.setFullName(payload.get("name").toString());

                        // Upload ảnh lên Cloudinary
                        String pictureUrl = payload.get("picture").toString();
                        System.out.println("Attempting to upload Google avatar from URL: " + pictureUrl);
                        try {
                                // Tạo temporary file từ URL ảnh Google
                                java.io.File tempFile = java.io.File.createTempFile("google_avatar", ".jpg");
                                System.out.println("Created temp file: " + tempFile.getAbsolutePath());

                                // Download ảnh từ Google về temp file
                                try (InputStream in = URI.create(pictureUrl).toURL().openStream();
                                                FileOutputStream out = new FileOutputStream(tempFile)) {
                                        IOUtils.copy(in, out);
                                }
                                System.out.println("Downloaded image from Google to temp file, size: "
                                                + tempFile.length() + " bytes");

                                // Upload lên Cloudinary
                                System.out.println("Uploading to Cloudinary...");
                                Map<String, String> uploadResult = cloudinaryService.uploadFile(tempFile);
                                String cloudinaryUrl = uploadResult.get("url");
                                System.out.println("Upload successful! Cloudinary URL: " + cloudinaryUrl);
                                profile.setAvatar(cloudinaryUrl);

                                // Xóa temp file
                                boolean deleted = tempFile.delete();
                                System.out.println("Temp file deleted: " + deleted);
                        } catch (Exception e) {
                                profile.setAvatar(null);
                                System.err.println("Failed to upload avatar to Cloudinary: " + e.getMessage());
                                e.printStackTrace(); // In stack trace để debug
                        }

                        // Code cũ
                        /*
                         * String pictureUrl = payload.get("picture").toString();
                         * String fileName = "google_" + System.currentTimeMillis() + ".jpg";
                         * String uploadPath = "public/uploads/" + fileName;
                         * try (InputStream in = URI.create(pictureUrl).toURL().openStream();
                         * FileOutputStream out = new FileOutputStream(uploadPath)) {
                         * IOUtils.copy(in, out);
                         * profile.setAvatar("/uploads/" + fileName);
                         * } catch (Exception e) {
                         * profile.setAvatar(null);
                         * }
                         */
                        user.setProfile(profile);
                        // Gán role USER
                        Role userRole = roleJpaRepository.findByName("Users").orElseThrow();
                        user.setRoles(List.of(userRole));
                        userJpaRepository.save(user);
                }

                if (user.getIsActive() == 1) {
                        throw new HttpException("Your account is not active. Please contact support.",
                                        HttpStatus.FORBIDDEN);
                }

                String accessToken = jwtService.generateAccessToken(user);
                String refreshToken = jwtService.generateRefreshToken(user);

                UserProfileResponseDto userProfileDto = null;
                AddressResponseDto addressDto = null;

                if (user.getProfile() != null) {
                        if (user.getProfile().getAddress() != null
                                        && user.getProfile().getAddress().getWard() != null) {
                                addressDto = convertAddressDto(user.getProfile().getAddress());
                        }

                        userProfileDto = UserProfileResponseDto.builder()
                                        .id(user.getProfile().getId())
                                        .fullName(user.getProfile().getFullName())
                                        .email(user.getProfile().getEmail())
                                        .phoneNumber(user.getProfile().getPhoneNumber())
                                        .avatar(user.getProfile().getAvatar())
                                        .bankName(user.getProfile().getBankName())
                                        .bankNumber(user.getProfile().getBankNumber())
                                        .binCode(user.getProfile().getBinCode())
                                        .accoutHolderName(user.getProfile().getAccoutHolderName())
                                        .address(addressDto)
                                        .build();
                }
                return LoginResponseDto.builder()
                                .id(user.getId())
                                .username(user.getUsername())
                                .userProfile(userProfileDto)
                                .roles(user.getRoles() != null
                                                ? user.getRoles().stream().map(Role::getName).toList()
                                                : null)
                                .accessToken(accessToken)
                                .refreshToken(refreshToken)
                                .build();

        }

        @CacheEvict(value = "manage-accounts", allEntries = true)
        public RegisterResponseDto register(RegisterRequestDto request) {
                if (userJpaRepository.existsByUsername(request.getUsername())) {
                        throw new IllegalArgumentException("Username already exists");
                }
                if (profileJpaRepository.existsByEmail(request.getEmail())) {
                        throw new IllegalArgumentException("Email already exists");
                }

                User user = new User();
                user.setUsername(request.getUsername());
                user.setPassword(passwordEncoder.encode(request.getPassword()));
                UserProfile userProfile = new UserProfile();
                userProfile.setEmail(request.getEmail());
                userProfile.setFullName(request.getFullName());
                user.setProfile(userProfile);

                if (request.getAccountType() == 0) {
                        Role userRole = roleJpaRepository.findByName("Users").orElseThrow();
                        user.setRoles(List.of(userRole));
                } else if (request.getAccountType() == 1) {
                        Role landlordRole = roleJpaRepository.findByName("Landlords").orElseThrow();
                        user.setRoles(List.of(landlordRole));
                }

                // System.out.println(
                // "User register: username=" + user.getUsername() + ", email=" +
                // userProfile.getEmail()
                // + ", password=" + user.getPassword() + ", accountType="
                // + request.getAccountType());
                userJpaRepository.save(user);

                return RegisterResponseDto.builder()
                                .username(user.getUsername())
                                .message("Registration successful")
                                .build();
        }

        public String generateResetCode() {
                Random random = new Random();
                // Tạo số ngẫu nhiên từ 100000 đến 999999
                int code = 100000 + random.nextInt(900000);
                return String.valueOf(code);
        }

        @Transactional
        public void resetPassword(String email) {
                System.err.println("Reset password for email: " + email);
                if (!profileJpaRepository.existsByEmail(email)) {
                        throw new IllegalArgumentException("Email not found");
                }

                String resetCode = generateResetCode();
                User user = userJpaRepository.findByProfileEmail(email)
                                .orElseThrow(() -> new IllegalArgumentException(
                                                "User not found for email: " + email));
                user.setResetPasswordCode(resetCode);
                user.setResetPasswordCodeCreationTime(LocalDateTime.now());
                userJpaRepository.save(user);

                mailService.sendResetCode(email, resetCode);

        }

        public boolean verifyResetCode(String email, String code) {
                User user = userJpaRepository.findByProfileEmail(email)
                                .orElseThrow(() -> new IllegalArgumentException(
                                                "User not found for email: " + email));

                if (user.getResetPasswordCode() == null || !user.getResetPasswordCode().equals(code)) {
                        throw new IllegalArgumentException("Invalid reset code");
                }

                if (user.getResetPasswordCodeCreationTime() == null
                                || user.getResetPasswordCodeCreationTime()
                                                .isBefore(LocalDateTime.now().minusMinutes(5))) {
                        throw new IllegalArgumentException("Reset code has expired");
                }
                return true;

        }

        public boolean updatePassword(String email, String newPassword, String resetCode) {
                User user = userJpaRepository.findByProfileEmail(email)
                                .orElseThrow(() -> new UsernameNotFoundException(
                                                "User not found in database for email: " + email));

                if (user.getResetPasswordCode() == null ||
                                !user.getResetPasswordCode().equals(resetCode)) {
                        throw new IllegalArgumentException("Invalid reset code");
                }

                if (user.getResetPasswordCodeCreationTime() == null
                                || user.getResetPasswordCodeCreationTime()
                                                .isBefore(LocalDateTime.now().minusMinutes(5))) {
                        throw new IllegalArgumentException("Reset code has expired");
                }

                user.setPassword(passwordEncoder.encode(newPassword));
                user.setResetPasswordCode(null);
                user.setResetPasswordCodeCreationTime(null);
                userJpaRepository.save(user);
                return true;
        }

        public UUID getAuthenticatedUserId() {
                Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
                String username = authentication.getName(); // Lấy username từ Principal

                User user = userJpaRepository.findByUsername(username) // Sử dụng userJpaRepository đã được @Autowired
                                .orElseThrow(() -> new UsernameNotFoundException(
                                                "User not found in database for username: " + username));

                return user.getId();
        }

        public boolean changePassword(UUID userId, String password, String newPassword) {
                User user = userJpaRepository.findById(userId)
                                .orElseThrow(() -> new UsernameNotFoundException(
                                                "User not found in database for ID: " + userId));

                if (!passwordEncoder.matches(password, user.getPassword())) {
                        throw new IllegalArgumentException("Current password is incorrect");
                }

                user.setPassword(passwordEncoder.encode(newPassword));
                userJpaRepository.save(user);
                return true;
        }

        private String formatHexToUuid(String hex) {
                return hex.replaceFirst(
                                "(\\w{8})(\\w{4})(\\w{4})(\\w{4})(\\w{12})",
                                "$1-$2-$3-$4-$5");
        }

        public LandlordResponseByRoomDto getLandlordInfoByRoomId(UUID roomId) {
                LandLordProjectionByRoom landlord = userJpaRepository.findLandlord(roomId)
                                .orElseThrow(() -> new IllegalArgumentException(
                                                "Landlord not found for room ID: " + roomId));
                String idHex = landlord.getId();
                UUID uuid = null;
                if (idHex != null) {
                        uuid = UUID.fromString(formatHexToUuid(idHex));
                }
                int amountPost = userJpaRepository.countRoomsByUserId(uuid);
                return LandlordResponseByRoomDto.builder()
                                .id(uuid)
                                .fullName(landlord.getFullName())
                                .email(landlord.getEmail())
                                .avatar(landlord.getAvatar())
                                .amountPost(amountPost)
                                .phone(landlord.getPhone())
                                .createDate(landlord.getCreateDate())
                                .build();
        }

        public User findNameById(UUID userId) {
                return userJpaRepository.findById(userId)
                                .orElseThrow(() -> new UsernameNotFoundException(
                                                "User not found in database for ID: " + userId));
        }

}