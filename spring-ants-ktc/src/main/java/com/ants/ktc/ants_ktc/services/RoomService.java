package com.ants.ktc.ants_ktc.services;

import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDate;
import java.time.ZoneId;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.UUID;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import com.ants.ktc.ants_ktc.dtos.address.AddressResponseDto;
import com.ants.ktc.ants_ktc.dtos.address.DistrictResponseDto;
import com.ants.ktc.ants_ktc.dtos.address.ProvinceResponseDto;
import com.ants.ktc.ants_ktc.dtos.address.WardResponseDto;
import com.ants.ktc.ants_ktc.dtos.convenient.ConvenientResponseDto;
import com.ants.ktc.ants_ktc.dtos.filters.FilterRoomRequestDto;
import com.ants.ktc.ants_ktc.dtos.image.ImageResponseDto;
import com.ants.ktc.ants_ktc.dtos.room.PaginationRoomAdminResponseDto;
import com.ants.ktc.ants_ktc.dtos.room.PaginationRoomInUserResponseDto;
import com.ants.ktc.ants_ktc.dtos.room.PaginationRoomResponseDto;
import com.ants.ktc.ants_ktc.dtos.room.RoomAdminResponseProjectionDto;
import com.ants.ktc.ants_ktc.dtos.room.RoomApprovalProjectionDto;
import com.ants.ktc.ants_ktc.dtos.room.RoomDeleteRequestDto;
import com.ants.ktc.ants_ktc.dtos.room.RoomInMapResponse;
import com.ants.ktc.ants_ktc.dtos.room.RoomInUserResponseDto;
import com.ants.ktc.ants_ktc.dtos.room.RoomRecentResponseDto;
import com.ants.ktc.ants_ktc.dtos.room.RoomRequestCreateDto;
import com.ants.ktc.ants_ktc.dtos.room.RoomRequestUpdateDto;
import com.ants.ktc.ants_ktc.dtos.room.RoomResponseDto;
import com.ants.ktc.ants_ktc.dtos.room.RoomResponseProjectionDto;
import com.ants.ktc.ants_ktc.dtos.room.RoomShowHideProjectionDto;
import com.ants.ktc.ants_ktc.dtos.room.RoomUpdateExpireDateRequestDto;
import com.ants.ktc.ants_ktc.dtos.room.RoomUpdateExpireDateResponseDto;
import com.ants.ktc.ants_ktc.dtos.user.LandlordResponseDto;
import com.ants.ktc.ants_ktc.dtos.userprofile.LandlordProfileResponseDto;
import com.ants.ktc.ants_ktc.entities.Convenient;
import com.ants.ktc.ants_ktc.entities.Image;
import com.ants.ktc.ants_ktc.entities.PostType;
import com.ants.ktc.ants_ktc.entities.Room;
import com.ants.ktc.ants_ktc.entities.Transaction;
import com.ants.ktc.ants_ktc.entities.User;
import com.ants.ktc.ants_ktc.entities.address.Address;
import com.ants.ktc.ants_ktc.entities.address.Ward;
import com.ants.ktc.ants_ktc.models.ImageUploadMessage;
import com.ants.ktc.ants_ktc.repositories.ConvenientsRepository;
import com.ants.ktc.ants_ktc.repositories.ImageJpaRepository;
import com.ants.ktc.ants_ktc.repositories.PostTypeJpaRepository;
import com.ants.ktc.ants_ktc.repositories.RoomJpaRepository;
import com.ants.ktc.ants_ktc.repositories.TransactionsJpaRepository;
import com.ants.ktc.ants_ktc.repositories.UserJpaRepository;
import com.ants.ktc.ants_ktc.repositories.address.WardJpaRepository;
import com.ants.ktc.ants_ktc.repositories.projection.FilterBasicProjection;
import com.ants.ktc.ants_ktc.repositories.projection.RoomApprovalProjection;
import com.ants.ktc.ants_ktc.repositories.projection.RoomByAdminPagingProjection;
import com.ants.ktc.ants_ktc.repositories.projection.RoomByLandlordPagingProjection;
import com.ants.ktc.ants_ktc.repositories.projection.RoomMapProjection;
import com.ants.ktc.ants_ktc.repositories.projection.RoomNewProjection;

@Service
public class RoomService {
        @Autowired
        private RoomJpaRepository roomJpaRepository;

        @Autowired
        private PostTypeJpaRepository postTypeJpaRepository;

        @Autowired
        private UserJpaRepository userJpaRepository;

        @Autowired
        private WardJpaRepository wardRepository;

        @Autowired
        private ConvenientsRepository convenientJpaRepository;

        @Autowired
        private TransactionsJpaRepository transactionsJpaRepository;

        @Autowired
        private ImageJpaRepository imageJpaRepository;

        @Autowired
        private MailService mailService;

        @Autowired
        private CloudinaryService cloudinaryService;

        @Autowired
        private ProfileService profileService;

        @Autowired
        private LocationIQService locationIQService;

        @Autowired
        @Qualifier("imageRedisTemplate")
        private RedisTemplate<String, ImageUploadMessage> redisTemplate;

        private static final String IMAGE_UPLOAD_QUEUE = "image_upload_queue";
        private static final String TEMP_DIR_PREFIX = "room_images";

        /**
         * Lưu file tạm thời và tạo message để upload async
         */
        public ImageUploadMessage prepareAsyncImageUpload(MultipartFile file, UUID roomId) throws Exception {
                // Tạo temporary file
                String fileName = UUID.randomUUID().toString() + "_" + file.getOriginalFilename();
                Path tempDir = Paths.get(System.getProperty("java.io.tmpdir"), TEMP_DIR_PREFIX);
                Files.createDirectories(tempDir); // Tạo thư mục nếu chưa tồn tại
                Path tempFilePath = tempDir.resolve(fileName);

                // Ghi file vào disk tạm thời
                Files.write(tempFilePath, file.getBytes());

                Room room = roomJpaRepository.findById(roomId)
                                .orElseThrow(() -> new IllegalArgumentException("Room not found"));

                // Tạo Image entity với URL tạm thời và room đã có ID
                Image image = new Image();
                image.setUrl("pending://uploading"); // URL tạm thời để biết đang upload
                image.setRoom(room);
                imageJpaRepository.save(image);

                // Tạo message cho queue
                ImageUploadMessage message = new ImageUploadMessage();
                message.setRoomId(room.getId());
                message.setImageId(image.getId());
                message.setLocalTempPath(tempFilePath.toString());

                return message;
        }

        // view-rooms
        // public void increaseView(UUID roomId) {
        // Room room = roomJpaRepository.findById(roomId)
        // .orElseThrow(() -> new IllegalArgumentException("Room not found"));
        // room.setViewCount(room.getViewCount() + 1);
        // roomJpaRepository.save(room);
        // }
        public long increaseView(UUID roomId) {
                Room room = roomJpaRepository.findById(roomId)
                                .orElseThrow(() -> new IllegalArgumentException("Room not found"));
                room.setViewCount(room.getViewCount() + 1);
                roomJpaRepository.save(room);
                return room.getViewCount();
        }

        /**
         * Enqueue image upload job vào Redis
         */
        public void enqueueImageUpload(ImageUploadMessage message) {
                try {
                        redisTemplate.opsForList().rightPush(IMAGE_UPLOAD_QUEUE, message);
                } catch (Exception ex) {
                        throw new RuntimeException(
                                        "Redis server is not available. Please try again later or contact admin.", ex);
                }
        }

        private List<ImageResponseDto> convertImages(List<Image> images) {
                if (images == null)
                        return new ArrayList<>();
                return images.stream()
                                .map(img -> ImageResponseDto.builder()
                                                .id(img.getId())
                                                .url(img.getUrl())
                                                .build())
                                .collect(Collectors.toList());
        }

        private AddressResponseDto convertAddress(Address address) {
                if (address == null)
                        return null;
                Ward ward = address.getWard();
                DistrictResponseDto districtDto = null;
                ProvinceResponseDto provinceDto = null;
                if (ward != null && ward.getDistrict() != null) {
                        provinceDto = ProvinceResponseDto.builder()
                                        .id(ward.getDistrict().getProvince().getId())
                                        .name(ward.getDistrict().getProvince().getName())
                                        .build();
                        districtDto = DistrictResponseDto.builder()
                                        .id(ward.getDistrict().getId())
                                        .name(ward.getDistrict().getName())
                                        .province(provinceDto)
                                        .build();
                }
                WardResponseDto wardDto = ward == null ? null
                                : WardResponseDto.builder()
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

        private List<ConvenientResponseDto> convertConveniences(List<Convenient> conveniences) {
                if (conveniences == null)
                        return new ArrayList<>();
                // Ensure no null name
                conveniences.forEach(c -> {
                        if (c.getName() == null)
                                c.setName("");
                });
                return conveniences.stream()
                                .map(conv -> ConvenientResponseDto.builder()
                                                .id(conv.getId())
                                                .name(conv.getName())
                                                .build())
                                .collect(Collectors.toList());
        }

        private String removePrefix(String text, String prefix) {
                if (text == null)
                        return null;
                if (text.startsWith(prefix)) {
                        return text.substring(prefix.length()).trim();
                }
                return text;
        }

        @Transactional
        public RoomResponseDto createRoom(List<MultipartFile> files, RoomRequestCreateDto requestDto) {
                Room room = new Room();

                // Set các thuộc tính cơ bản
                room.setTitle(requestDto.getTitle());
                room.setDescription(requestDto.getDescription());
                room.setPrice_month(requestDto.getPriceMonth());
                room.setPrice_deposit(requestDto.getPriceDeposit());
                room.setRoomLength(requestDto.getRoomLength());
                room.setRoomWidth(requestDto.getRoomWidth());
                room.setElecPrice(requestDto.getElecPrice());
                room.setWaterPrice(requestDto.getWaterPrice());
                room.setMaxPeople(requestDto.getMaxPeople());
                // tính diện tích
                if (requestDto.getRoomLength() != null && requestDto.getRoomWidth() != null) {
                        room.setArea(requestDto.getRoomLength() * requestDto.getRoomWidth());
                } else {
                        room.setArea(0.0);
                }
                // Lấy PostType và User
                PostType postType = postTypeJpaRepository.findById(requestDto.getTypepostId())
                                .orElseThrow(() -> new IllegalArgumentException("PostType not found"));
                room.setPostType(postType);

                // Convert dates to LocalDate for validation
                LocalDate startDate = requestDto.getPostStartDate().toInstant().atZone(ZoneId.systemDefault())
                                .toLocalDate();
                LocalDate endDate = requestDto.getPostEndDate().toInstant().atZone(ZoneId.systemDefault())
                                .toLocalDate();
                LocalDate today = LocalDate.now(ZoneId.systemDefault());
                if (endDate.isBefore(startDate)) {
                        throw new IllegalArgumentException("End date must be after start date");
                }
                if (startDate.isBefore(today)) {
                        throw new IllegalArgumentException("Start date must be today or later");
                }

                // Use the exact dates from request (preserve time)
                room.setPost_start_date(requestDto.getPostStartDate());
                room.setPost_end_date(requestDto.getPostEndDate());

                long diffDays = ChronoUnit.DAYS.between(
                                requestDto.getPostStartDate().toInstant().atZone(ZoneId.systemDefault()).toLocalDate(),
                                requestDto.getPostEndDate().toInstant().atZone(ZoneId.systemDefault()).toLocalDate());
                if (diffDays == 0) {
                        diffDays = 1;
                }

                User user = userJpaRepository.findById(requestDto.getUserId())
                                .orElseThrow(() -> new IllegalArgumentException("User not found"));

                if (user.getProfile().getBankNumber() == null || user.getProfile().getBankNumber().isEmpty()) {
                        throw new IllegalArgumentException("User does not have a bank number set");
                }

                if (user.getWallet() == null) {
                        throw new IllegalArgumentException(
                                        "The user's wallet is not active. Please top up your wallet before creating a post");
                }

                // get price per day from PostType
                if (postType.getPricePerDay() == null) {
                        throw new IllegalArgumentException("PostType does not have price per day set");
                }
                Double pricePerDay = postType.getPricePerDay();
                Double totalPrice = diffDays * pricePerDay;

                System.out.println("Total Price: " + totalPrice);

                Double balance = user.getWallet().getBalance();
                System.out.println("User Balance: " + balance);
                System.out.println("Price total: " + totalPrice);
                if (totalPrice > balance) {
                        System.out.println("User does not have enough balance to create this room");
                        throw new IllegalArgumentException("User does not have enough balance to create this room");
                }

                // *** */
                Date transactionDate = new Date();
                user.getWallet().setBalance(balance - totalPrice);
                userJpaRepository.save(user);

                System.out.println("Diff Date: " + diffDays);

                // transaction
                Transaction transaction = new Transaction();
                transaction.setAmount(totalPrice);
                transaction.setDescription("Create a New Room Post " + room.getTitle());
                transaction.setTransactionDate(transactionDate);

                // Generate unique 8-digit transaction code (no prefix)
                String transactionCode = generateUniqueTransactionCode("CREATE", user.getId());

                // Code cũ - transaction code generation
                /*
                 * LocalDateTime now = LocalDateTime.now(ZoneId.systemDefault());
                 * String day = String.format("%02d", now.getDayOfMonth());
                 * String hour = String.format("%02d", now.getHour());
                 * String random = String.format("%04d", (int) (Math.random() * 10000));
                 * String transactionCode = day + hour + random;
                 */

                transaction.setTransactionCode(transactionCode);
                System.out.println("Transaction id before save: " + transaction.getId());

                transaction.setBankTransactionName("Ants Wallet");
                transaction.setDescription("Payment for room post: " + room.getTitle());
                transaction.setStatus(1); // 1: thành công, 0: thất bại

                transaction.setWallet(user.getWallet());
                transactionsJpaRepository.save(transaction);

                // if (diffDays * postType.getPricePerDay() > user.getWallet().getBalance()) {
                // throw new IllegalArgumentException("User does not have enough balance to
                // create this room");
                // }
                room.setUser(user);

                // Set địa chỉ
                Address address = new Address();
                address.setStreet(requestDto.getAddress().getStreet());

                Ward ward = wardRepository.findById(requestDto.getAddress().getWardId())
                                .orElseThrow(() -> new IllegalArgumentException("Ward Not Found"));
                address.setWard(ward);
                String fullAddress = requestDto.getAddress().getStreet() + ", " +
                                removePrefix(ward.getName(), "Phường") + ", " +
                                removePrefix(ward.getDistrict().getName(), "Quận") + ", " +
                                removePrefix(ward.getDistrict().getProvince().getName(), "Thành phố");
                try {
                        LocationIQService.LatLng latLng = locationIQService.getCoordinates(fullAddress);
                        if (latLng != null) {
                                address.setLng(latLng.lng);
                                address.setLat(latLng.lat);
                        }

                        room.setAddress(address);
                } catch (Exception e) {
                        throw new RuntimeException("Failed to get coordinates: " + e.getMessage(), e);
                }
                // set lng + lat

                // Set tiện ích (convenients)
                List<Convenient> convenients = convenientJpaRepository.findAllById(requestDto.getConvenientIds());
                if (convenients.size() != requestDto.getConvenientIds().size()) {
                        throw new IllegalArgumentException("Convenients not found");
                }
                // Ensure no null name
                convenients.forEach(c -> {
                        if (c.getName() == null)
                                c.setName("");
                });
                room.setConvenients(convenients);

                // // Xử lý ảnh cũ
                // List<Image> images = files.stream()
                // .filter(file -> file != null && !file.isEmpty())
                // .map(file -> {
                // try {
                // String fileName = System.currentTimeMillis() + "_"
                // + file.getOriginalFilename();
                // Path filePath = Paths.get("public/uploads/" + fileName);
                // Files.createDirectories(filePath.getParent());
                // Files.write(filePath, file.getBytes());

                // String fileUrl = "/uploads/" + fileName;
                // Image image = new Image();
                // image.setUrl(fileUrl);
                // image.setRoom(room); // quan hệ 2 chiều
                // return image;
                // } catch (Exception e) {
                // throw new RuntimeException("Failed to save file: " + e.getMessage(), e);
                // }
                // })
                // .toList();
                // room.setImages(images);

                // roomJpaRepository.save(room);

                // Lưu phòng trước để có ID
                roomJpaRepository.save(room);

                // Xử lý images - Async upload để không block user
                List<Image> images = new ArrayList<>();
                if (files != null && !files.isEmpty()) {
                        for (MultipartFile file : files) {
                                if (file != null && !file.isEmpty()) {
                                        try {
                                                // Tạo image record với URL tạm thời và enqueue upload job
                                                ImageUploadMessage message = prepareAsyncImageUpload(file,
                                                                room.getId());

                                                // Lấy image đã tạo
                                                Image image = imageJpaRepository.findById(message.getImageId())
                                                                .orElseThrow();
                                                images.add(image);

                                                // Enqueue upload job
                                                enqueueImageUpload(message);
                                        } catch (Exception e) {
                                                // Log error nhưng không fail toàn bộ quá trình
                                                System.err.println("Failed to prepare async upload for file: "
                                                                + e.getMessage());
                                        }
                                }
                        }
                }
                room.setImages(images);

                // Lưu room với images đã set
                roomJpaRepository.save(room);

                // Trả về DTO
                return RoomResponseDto.builder()
                                .id(room.getId())
                                .title(room.getTitle())
                                .description(room.getDescription())
                                .priceMonth(room.getPrice_month())
                                .priceDeposit(room.getPrice_deposit())
                                .postStartDate(room.getPost_start_date())
                                .postEndDate(room.getPost_end_date())
                                .area(room.getArea())
                                .roomLength(room.getRoomLength())
                                .roomWidth(room.getRoomWidth())
                                .elecPrice(room.getElecPrice())
                                .waterPrice(room.getWaterPrice())
                                .maxPeople(room.getMaxPeople())
                                .typepost(postType.getName())
                                .userId(user.getId())
                                .convenients(convenients.stream()
                                                .map(c -> ConvenientResponseDto.builder()
                                                                .id(c.getId())
                                                                .name(c.getName())
                                                                .build())
                                                .toList())
                                .images(convertImages(room.getImages()))
                                .address(convertAddress(room.getAddress()))
                                .build();
        }

        // update room
        @Transactional
        public RoomResponseDto updateRoom(UUID id, List<MultipartFile> images, RoomRequestUpdateDto request)
                        throws Exception {
                Room room = roomJpaRepository.findById(id)
                                .orElseThrow(() -> new IllegalArgumentException("Room not found"));

                // Lưu dữ liệu cũ để so sánh
                String oldTitle = room.getTitle();
                String oldDescription = room.getDescription();
                List<Image> oldImages = imageJpaRepository.findByRoomId(id);

                // Cập nhật thông tin cơ bản
                room.setTitle(request.getTitle());
                room.setDescription(request.getDescription());
                room.setPrice_month(request.getPriceMonth());
                room.setPrice_deposit(request.getPriceDeposit());
                room.setRoomLength(request.getRoomLength());
                room.setRoomWidth(request.getRoomWidth());
                room.setElecPrice(request.getElecPrice());
                room.setWaterPrice(request.getWaterPrice());
                room.setMaxPeople(request.getMaxPeople());
                // tính diện tích
                if (request.getRoomLength() != null && request.getRoomWidth() != null) {
                        room.setArea(request.getRoomLength() * request.getRoomWidth());
                } else {
                        room.setArea(0.0);
                }

                // Set địa chỉ
                Address address = room.getAddress();
                if (address == null) {
                        address = new Address();
                }
                address.setStreet(request.getAddress().getStreet());
                Ward ward = wardRepository.findById(request.getAddress().getWardId())
                                .orElseThrow(() -> new IllegalArgumentException("Ward Not Found"));
                address.setWard(ward);
                String fullAddress = request.getAddress().getStreet() + ", " +
                                removePrefix(ward.getName(), "Phường") + ", " +
                                removePrefix(ward.getDistrict().getName(), "Quận") + ", " +
                                removePrefix(ward.getDistrict().getProvince().getName(), "Thành phố");
                try {
                        LocationIQService.LatLng latLng = locationIQService.getCoordinates(fullAddress);
                        if (latLng != null) {
                                address.setLng(latLng.lng);
                                address.setLat(latLng.lat);
                        }

                        room.setAddress(address);
                } catch (Exception e) {
                        throw new RuntimeException("Failed to get coordinates: " + e.getMessage(), e);
                }

                // Set tiện ích (convenients)
                List<Convenient> convenients = convenientJpaRepository.findAllById(request.getConvenientIds());
                if (convenients.size() != request.getConvenientIds().size()) {
                        throw new IllegalArgumentException("Convenients not found");
                }
                // Ensure no null name
                convenients.forEach(c -> {
                        if (c.getName() == null)
                                c.setName("");
                });
                room.setConvenients(convenients);

                // Xử lý cập nhật ảnh
                // 1. Lấy danh sách ảnh cũ
                List<Image> imagesToKeep = new ArrayList<>();
                boolean imageChanged = false;

                if (request.getExistingImages() != null) {
                        // Xóa các ảnh nằm trong existingImages, giữ lại phần còn lại
                        List<String> existingImageUrls = request.getExistingImages();
                        for (Image img : oldImages) {
                                if (existingImageUrls.contains(img.getUrl())) {
                                        imageJpaRepository.delete(img);
                                        deleteFileFromStorage(img.getUrl());
                                        imageChanged = true;
                                } else {
                                        imagesToKeep.add(img);
                                }
                        }
                } else {
                        // Nếu null => giữ nguyên toàn bộ ảnh cũ
                        imagesToKeep.addAll(oldImages);
                }

                // // Thêm ảnh mới - code cũ
                // if (images != null && !images.isEmpty()) {
                // for (MultipartFile file : images) {
                // if (!file.isEmpty()) {
                // String fileName = System.currentTimeMillis() + "_" +
                // file.getOriginalFilename();
                // Path filePath = Paths.get("public/uploads/" + fileName);
                // Files.createDirectories(filePath.getParent());
                // Files.write(filePath, file.getBytes());
                // String fileUrl = "/uploads/" + fileName;

                // Image image = new Image();
                // image.setRoom(room);
                // image.setUrl(fileUrl);
                // imageJpaRepository.save(image);
                // imagesToKeep.add(image);
                // }
                // }
                // }

                // Thêm ảnh mới - Async upload để không block user
                if (images != null && !images.isEmpty()) {
                        for (MultipartFile file : images) {
                                if (file != null && !file.isEmpty()) {
                                        try {
                                                // Tạo image record với URL tạm thời và enqueue upload job
                                                ImageUploadMessage message = prepareAsyncImageUpload(file,
                                                                room.getId());

                                                // Lấy image đã tạo
                                                Image image = imageJpaRepository.findById(message.getImageId())
                                                                .orElseThrow();
                                                imagesToKeep.add(image);

                                                // Enqueue upload job
                                                enqueueImageUpload(message);

                                                imageChanged = true;
                                        } catch (Exception e) {
                                                // Log error nhưng không fail toàn bộ quá trình
                                                System.err.println("Failed to prepare async upload for file: "
                                                                + e.getMessage());
                                        }
                                }
                        }
                }

                // Cập nhật danh sách ảnh vào room
                room.setImages(imagesToKeep);

                List<Image> updatedImages = imagesToKeep;

                // ✅ Chỉ setApproval = 0 nếu có thay đổi title, description hoặc image
                if (!Objects.equals(oldTitle, request.getTitle()) ||
                                !Objects.equals(oldDescription, request.getDescription()) ||
                                imageChanged) {
                        room.setApproval(0);
                }

                // 4. Lưu room
                roomJpaRepository.save(room);
                return RoomResponseDto.builder()
                                .id(room.getId())
                                .title(room.getTitle())
                                .description(room.getDescription())
                                .priceMonth(room.getPrice_month())
                                .priceDeposit(room.getPrice_deposit())
                                .postStartDate(room.getPost_start_date())
                                .postEndDate(room.getPost_end_date())
                                .area(room.getArea())
                                .roomLength(room.getRoomLength())
                                .roomWidth(room.getRoomWidth())
                                .elecPrice(room.getElecPrice())
                                .waterPrice(room.getWaterPrice())
                                .maxPeople(room.getMaxPeople())
                                .typepost(room.getPostType().getName())
                                .userId(room.getUser().getId())
                                .convenients(convenients.stream()
                                                .map(c -> ConvenientResponseDto.builder()
                                                                .id(c.getId())
                                                                .name(c.getName())
                                                                .build())
                                                .toList())
                                .images(convertImages(updatedImages))
                                .address(convertAddress(room.getAddress()))
                                .build();
        }

        @Transactional(readOnly = true)
        public PaginationRoomResponseDto getAllRoomByLandlordIdPaginated(UUID userId, int page, int size) {

                // Ensure page is at least 1 (1-based)
                if (page < 1)
                        page = 1;
                Pageable pageable = PageRequest.of(page - 1, size);

                Page<RoomByLandlordPagingProjection> roomPage = roomJpaRepository.findAllByLandlord(userId, pageable);

                List<RoomResponseProjectionDto> roomDtos = roomPage.getContent().stream()
                                .map(this::convertToDto)
                                .toList();
                return PaginationRoomResponseDto.builder()
                                .rooms(roomDtos)
                                .pageNumber(roomPage.getNumber())
                                .pageSize(roomPage.getSize())
                                .totalRecords(roomPage.getTotalElements())
                                .totalPages(roomPage.getTotalPages())
                                .hasNext(roomPage.hasNext())
                                .hasPrevious(roomPage.hasPrevious())
                                .build();
        }

        @Transactional(readOnly = true)
        public PaginationRoomAdminResponseDto getAllRoomByAdminPaginated(int page, int size, String sortField,
                        String sortOrder) {
                String sortBy = (sortField != null && !sortField.isBlank()) ? sortField : "title";
                String direction = (sortOrder != null && sortOrder.equalsIgnoreCase("desc")) ? "desc" : "asc";
                Pageable pageable = PageRequest.of(page, size,
                                direction.equals("asc") ? Sort.by(sortBy).ascending() : Sort.by(sortBy).descending());
                Page<RoomByAdminPagingProjection> roomPage = roomJpaRepository.findAllByAdmin(pageable);

                List<RoomAdminResponseProjectionDto> roomDtos = roomPage.getContent().stream()
                                .map(this::convertToDto)
                                .toList();
                return PaginationRoomAdminResponseDto.builder()
                                .rooms(roomDtos)
                                .pageNumber(roomPage.getNumber())
                                .pageSize(roomPage.getSize())
                                .totalRecords(roomPage.getTotalElements())
                                .totalPages(roomPage.getTotalPages())
                                .hasNext(roomPage.hasNext())
                                .hasPrevious(roomPage.hasPrevious())
                                .build();
        }

        @Transactional
        public RoomUpdateExpireDateResponseDto updateExpirePostDate(RoomUpdateExpireDateRequestDto request) {
                Room room = roomJpaRepository.findForExtendById(request.getRoomId())
                                .orElseThrow(() -> new IllegalArgumentException("Room not found"));

                PostType postType = postTypeJpaRepository.findById(request.getTypepostId())
                                .orElseThrow(() -> new IllegalArgumentException("PostType not found"));
                room.setPostType(postType);

                // Parse ngày từ request (ISO string -> Date)
                Date newStartDate = request.getPostStartDate();
                Date newEndDate = request.getPostEndDate();

                LocalDate reqStartDate = newStartDate.toInstant().atZone(ZoneId.systemDefault()).toLocalDate();
                LocalDate reqEndDate = newEndDate.toInstant().atZone(ZoneId.systemDefault()).toLocalDate();
                long diffDays = ChronoUnit.DAYS.between(reqStartDate, reqEndDate);
                if (diffDays <= 0) {
                        throw new IllegalArgumentException("End date must be after start date");
                }

                // Tính tổng phí gia hạn
                Double pricePerDay = postType.getPricePerDay();
                Double totalPrice = diffDays * pricePerDay;

                // Trừ tiền ví
                User user = room.getUser();
                Double balance = user.getWallet().getBalance();
                if (totalPrice > balance) {
                        throw new IllegalArgumentException("User does not have enough balance to extend this room");
                }
                user.getWallet().setBalance(balance - totalPrice);
                userJpaRepository.save(user);

                Transaction transaction = new Transaction();
                transaction.setAmount(totalPrice);
                transaction.setDescription("Extend room post: " + room.getTitle());
                transaction.setTransactionDate(new Date());

                // Generate unique 8-digit transaction code
                String transactionCode = generateUniqueTransactionCode("EXT", user.getId());

                // Code cũ
                /*
                 * LocalDateTime now = LocalDateTime.now(ZoneId.systemDefault());
                 * String day = String.format("%02d", now.getDayOfMonth());
                 * String hour = String.format("%02d", now.getHour());
                 * String random = String.format("%04d", (int) (Math.random() * 10000));
                 * String transactionCode = day + hour + random;
                 */

                transaction.setTransactionCode(transactionCode);
                transaction.setBankTransactionName("Ants Wallet");
                transaction.setStatus(1); // 1: thành công
                transaction.setWallet(user.getWallet());
                transactionsJpaRepository.save(transaction);

                // Sử dụng trực tiếp ngày từ request để giữ nguyên thời gian (giờ, phút, giây)
                room.setPost_start_date(newStartDate);
                room.setPost_end_date(newEndDate);
                roomJpaRepository.save(room);

                // Trả về DTO với ngày gốc từ request
                return RoomUpdateExpireDateResponseDto.builder()
                                .postStartDate(newStartDate)
                                .postEndDate(newEndDate)
                                .message("Room post updated successfully").build();
        }

        @Transactional
        public RoomShowHideProjectionDto updateHidden(UUID roomId, RoomShowHideProjectionDto hidden) {
                // Kiểm tra phòng tồn tại bằng projection
                roomJpaRepository.findHiddenProjectionById(roomId)
                                .orElseThrow(() -> new IllegalArgumentException("Room not found"));

                // Cập nhật trạng thái hidden bằng JPQL update
                roomJpaRepository.updateHiddenById(roomId, hidden.getIsHidden());

                return RoomShowHideProjectionDto.builder()
                                .isHidden(hidden.getIsHidden())
                                .message("Room visibility updated successfully"
                                                + (hidden.getIsHidden() == 1 ? " (hidden)" : " (visible)"))
                                .build();
        }

        @Transactional
        public RoomDeleteRequestDto deleteRoom(UUID roomId, RoomDeleteRequestDto request) {
                // Kiểm tra phòng tồn tại bằng projection
                roomJpaRepository.findDeleteProjectionById(roomId)
                                .orElseThrow(() -> new IllegalArgumentException("Room not found"));

                // Cập nhật trạng thái isRemoved bằng JPQL update
                roomJpaRepository.updateIsRemovedById(roomId, request.getIsRemoved());

                return RoomDeleteRequestDto.builder()
                                .isRemoved(request.getIsRemoved())
                                .message("Room deleted successfully")
                                .build();
        }

        @Transactional
        public RoomApprovalProjectionDto updateApproval(UUID roomId, RoomApprovalProjectionDto approval) {
                RoomApprovalProjection roomProj = roomJpaRepository.findApprovalProjectionById(roomId)
                                .orElseThrow(() -> new IllegalArgumentException("Room not found"));

                int oldApproval = roomProj.getApproval();
                int newApproval = approval.getApproval();
                User user = roomProj.getUser();

                // Hoàn tiền khi oldApproval == 0 && newApproval == 2
                if (oldApproval == 0 && newApproval == 2) {
                        // Calculate expected transaction amount based on room posting duration and post
                        // type price
                        LocalDate startDate = roomProj.getPostStartDate().toInstant()
                                        .atZone(ZoneId.systemDefault()).toLocalDate();
                        LocalDate endDate = roomProj.getPostEndDate().toInstant()
                                        .atZone(ZoneId.systemDefault()).toLocalDate();
                        long diffDays = ChronoUnit.DAYS.between(startDate, endDate);

                        Double expectedAmount = null;
                        if (roomProj.getPostType() != null && roomProj.getPostType().getPricePerDay() != null) {
                                expectedAmount = diffDays * roomProj.getPostType().getPricePerDay();
                        }

                        // Try to find the transaction using wallet, type, room title, and expected
                        // amount for highest accuracy
                        Transaction lastTransaction = null;
                        if (expectedAmount != null) {
                                lastTransaction = transactionsJpaRepository
                                                .findLatestTransactionByWalletTypeDescriptionAndAmount(
                                                                user.getWallet(), 0, roomProj.getTitle(),
                                                                expectedAmount);
                        }

                        // // Fallback 1: Find by wallet, type and room title (good accuracy)
                        // if (lastTransaction == null) {
                        // lastTransaction = transactionsJpaRepository
                        // .findLatestTransactionByWalletTypeAndDescription(
                        // user.getWallet(), 0, roomProj.getTitle());
                        // }

                        // // Fallback 2: Find by wallet and type only (lowest accuracy, use with
                        // caution)
                        // if (lastTransaction == null) {
                        // lastTransaction = transactionsJpaRepository
                        // .findLatestTransactionByWalletAndType(user.getWallet(), 0);
                        // }

                        if (lastTransaction != null) {
                                Double refundAmount = lastTransaction.getAmount();
                                Double balance = user.getWallet().getBalance();
                                user.getWallet().setBalance(balance + refundAmount);
                                userJpaRepository.save(user);

                                Transaction refundTransaction = new Transaction();
                                refundTransaction.setAmount(refundAmount);
                                refundTransaction.setDescription(
                                                "Refund for rejected room post: " + roomProj.getTitle());
                                refundTransaction.setTransactionDate(new Date());

                                // Generate unique 8-digit transaction code
                                String transactionCode = generateUniqueTransactionCode("REFUND", user.getId());

                                // Code cũ
                                /*
                                 * LocalDateTime now = LocalDateTime.now(ZoneId.systemDefault());
                                 * String day = String.format("%02d", now.getDayOfMonth());
                                 * String hour = String.format("%02d", now.getHour());
                                 * String random = String.format("%04d", (int) (Math.random() * 10000));
                                 * String transactionCode = day + hour + random;
                                 */

                                refundTransaction.setTransactionCode(transactionCode);
                                refundTransaction.setBankTransactionName("Ants Wallet");
                                refundTransaction.setStatus(1);
                                refundTransaction.setWallet(user.getWallet());
                                refundTransaction.setTransactionType(3);// type 3: hoàn tiền
                                transactionsJpaRepository.save(refundTransaction);

                                // Cập nhật approval
                                roomJpaRepository.updateApprovalById(roomId, newApproval);
                        }
                }

                roomJpaRepository.updateApprovalById(roomId, newApproval);
                return RoomApprovalProjectionDto.builder()
                                .approval(newApproval)
                                .message("Room approval status updated successfully"
                                                + (newApproval == 1 ? " approved" : " rejected"))
                                .build();
        }

        public RoomResponseDto getRoomById(UUID id) {
                Room room = roomJpaRepository.findDetailedById(id)
                                .orElseThrow(() -> new IllegalArgumentException("Room not found"));

                return RoomResponseDto.builder()
                                .id(room.getId())
                                .title(room.getTitle())
                                .description(room.getDescription())
                                .priceMonth(room.getPrice_month())
                                .priceDeposit(room.getPrice_deposit())
                                .postStartDate(room.getPost_start_date())
                                .area(room.getArea())
                                .roomLength(room.getRoomLength())
                                .roomWidth(room.getRoomWidth())
                                .elecPrice(room.getElecPrice())
                                .waterPrice(room.getWaterPrice())
                                .maxPeople(room.getMaxPeople())
                                .postEndDate(room.getPost_end_date())
                                .typepost(room.getPostType().getName())
                                .userId(room.getUser().getId())
                                .convenients(room.getConvenients().stream()
                                                .map(c -> ConvenientResponseDto.builder()
                                                                .id(c.getId())
                                                                .name(c.getName() == null ? "" : c.getName())
                                                                .build())
                                                .toList())
                                .images(convertImages(room.getImages()))
                                .address(convertAddress(room.getAddress()))
                                .viewCount(room.getViewCount())
                                .build();
        }

        public RoomResponseProjectionDto convertToDto(RoomByLandlordPagingProjection room) {
                return RoomResponseProjectionDto.builder()
                                .id(room.getId())
                                .title(room.getTitle())
                                .description(room.getDescription())
                                .available(room.getAvailable())
                                .approval(room.getApproval())
                                .hidden(room.getHidden())
                                .isRemoved(room.getIsRemoved())
                                .area(room.getArea())
                                .elecPrice(room.getElecPrice())
                                .waterPrice(room.getWaterPrice())
                                .roomLength(room.getRoomLength())
                                .roomWidth(room.getRoomWidth())
                                .maxPeople(room.getMaxPeople())
                                .priceMonth(room.getPrice_month())
                                .priceDeposit(room.getPrice_deposit())
                                .postStartDate(room.getPost_start_date())
                                .postEndDate(room.getPost_end_date())
                                .typepost(room.getPostType() == null ? null : room.getPostType().getName())
                                .address(convertAddress(room.getAddress()))
                                .build();
        }

        // Overloaded convertAddress for RoomByLandlordPagingProjection.AddressInfo
        private AddressResponseDto convertAddress(RoomByLandlordPagingProjection.AddressInfo addressInfo) {
                if (addressInfo == null)
                        return null;
                var wardInfo = addressInfo.getWard();
                DistrictResponseDto districtDto = null;
                ProvinceResponseDto provinceDto = null;
                if (wardInfo != null && wardInfo.getDistrict() != null) {
                        var provinceInfo = wardInfo.getDistrict().getProvince();
                        if (provinceInfo != null) {
                                provinceDto = ProvinceResponseDto.builder()
                                                .id(provinceInfo.getId())
                                                .name(provinceInfo.getName())
                                                .build();
                        }
                        districtDto = DistrictResponseDto.builder()
                                        .id(wardInfo.getDistrict().getId())
                                        .name(wardInfo.getDistrict().getName())
                                        .province(provinceDto)
                                        .build();
                }
                WardResponseDto wardDto = wardInfo == null ? null
                                : WardResponseDto.builder()
                                                .id(wardInfo.getId())
                                                .name(wardInfo.getName())
                                                .district(districtDto)
                                                .build();

                return AddressResponseDto.builder()
                                .id(addressInfo.getId())
                                .street(addressInfo.getStreet())
                                .ward(wardDto)
                                .build();
        }

        // Overloaded convertAddress for RoomByAdminPagingProjection.AddressInfo
        private AddressResponseDto convertAddress(RoomByAdminPagingProjection.AddressInfo addressInfo) {
                if (addressInfo == null)
                        return null;
                var wardInfo = addressInfo.getWard();
                DistrictResponseDto districtDto = null;
                ProvinceResponseDto provinceDto = null;
                if (wardInfo != null && wardInfo.getDistrict() != null) {
                        var provinceInfo = wardInfo.getDistrict().getProvince();
                        if (provinceInfo != null) {
                                provinceDto = ProvinceResponseDto.builder()
                                                .id(provinceInfo.getId())
                                                .name(provinceInfo.getName())
                                                .build();
                        }
                        districtDto = DistrictResponseDto.builder()
                                        .id(wardInfo.getDistrict().getId())
                                        .name(wardInfo.getDistrict().getName())
                                        .province(provinceDto)
                                        .build();
                }
                WardResponseDto wardDto = wardInfo == null ? null
                                : WardResponseDto.builder()
                                                .id(wardInfo.getId())
                                                .name(wardInfo.getName())
                                                .district(districtDto)
                                                .build();

                return AddressResponseDto.builder()
                                .id(addressInfo.getId())
                                .street(addressInfo.getStreet())
                                .ward(wardDto)
                                .build();
        }

        // converter room pagin find by user id
        public RoomAdminResponseProjectionDto convertToDto(RoomByAdminPagingProjection room) {
                return RoomAdminResponseProjectionDto.builder()
                                .id(room.getId())
                                .title(room.getTitle())
                                .landlordFullName(
                                                room.getUser() != null && room.getUser()
                                                                .getProfile() instanceof RoomByAdminPagingProjection.UserInfo.ProfileInfo
                                                                                ? ((RoomByAdminPagingProjection.UserInfo.ProfileInfo) room
                                                                                                .getUser().getProfile())
                                                                                                .getFullName()
                                                                                : null)
                                .landlordEmail(
                                                room.getUser() != null && room.getUser()
                                                                .getProfile() instanceof RoomByAdminPagingProjection.UserInfo.ProfileInfo
                                                                                ? ((RoomByAdminPagingProjection.UserInfo.ProfileInfo) room
                                                                                                .getUser().getProfile())
                                                                                                .getEmail()
                                                                                : null)
                                .description(room.getDescription())
                                .available(room.getAvailable())
                                .approval(room.getApproval())
                                .hidden(room.getHidden())
                                .isRemoved(room.getIsRemoved())
                                .priceMonth(room.getPrice_month())
                                .priceDeposit(room.getPrice_deposit())
                                .postStartDate(room.getPost_start_date())
                                .postEndDate(room.getPost_end_date())
                                .typepost(room.getPostType() == null ? null : room.getPostType().getName())
                                .address(convertAddress(room.getAddress()))
                                .build();
        }

        private void deleteFileFromStorage(String fileUrl) {
                try {
                        // Check if it's a Cloudinary URL (starts with cloud name path)
                        if (fileUrl != null && fileUrl.contains("cloudinary")) {
                                // Extract public_id from Cloudinary URL for deletion
                                try {
                                        // Cloudinary URL format: /cloudname/image/upload/version/public_id.extension
                                        // fileUrl format: /cloudname/image/upload/v1234567890/folder/filename.jpg
                                        String publicId = extractPublicIdFromUrl(fileUrl);
                                        if (publicId != null && !publicId.isEmpty()) {
                                                cloudinaryService.deleteFile(publicId);
                                                System.out.println("Successfully deleted file from Cloudinary: "
                                                                + publicId);
                                        } else {
                                                System.out.println("Could not extract public_id from URL: " + fileUrl);
                                        }
                                } catch (Exception e) {
                                        System.err.println("Failed to delete file from Cloudinary: " + e.getMessage());
                                        e.printStackTrace();
                                }

                                // Code cũ
                                /*
                                 * // Note: For proper Cloudinary deletion, we would need the public_id
                                 * // Since we don't store public_id in the Image entity, we cannot delete from
                                 * // Cloudinary
                                 * // Consider adding a public_id field to the Image entity for proper cleanup
                                 * System.out.
                                 * println("Cloudinary file deletion skipped - public_id not available: "
                                 * + fileUrl);
                                 */
                        } else if (fileUrl != null && fileUrl.startsWith("/uploads/")) {
                                // Handle local files (legacy support)
                                long count = imageJpaRepository.countByUrl(fileUrl);
                                if (count == 0) {
                                        String fileName = fileUrl.substring("/uploads/".length());
                                        if (fileName.contains("\\")) {
                                                fileName = fileName.substring(fileName.lastIndexOf("\\") + 1);
                                        }
                                        if (fileName.contains("/")) {
                                                fileName = fileName.substring(fileName.lastIndexOf("/") + 1);
                                        }
                                        Path projectRoot = Paths.get("").toAbsolutePath();
                                        Path filePath = projectRoot.resolve("public").resolve("uploads")
                                                        .resolve(fileName);
                                        Files.deleteIfExists(filePath);
                                }
                        }
                } catch (java.io.IOException e) {
                        e.printStackTrace();
                }
        }

        /**
         * Extract public_id from Cloudinary URL
         * URL format: /cloudname/image/upload/v1234567890/folder/filename.jpg
         * public_id: folder/filename (without extension)
         */
        private String extractPublicIdFromUrl(String cloudinaryUrl) {
                try {
                        if (cloudinaryUrl == null || !cloudinaryUrl.contains("/upload/")) {
                                return null;
                        }

                        // Split by "/upload/" and take the part after it
                        String[] parts = cloudinaryUrl.split("/upload/");
                        if (parts.length < 2) {
                                return null;
                        }

                        String afterUpload = parts[1];

                        // Remove version (v1234567890) if present
                        if (afterUpload.startsWith("v") && afterUpload.contains("/")) {
                                int firstSlash = afterUpload.indexOf("/");
                                afterUpload = afterUpload.substring(firstSlash + 1);
                        }

                        // Remove file extension
                        int lastDot = afterUpload.lastIndexOf(".");
                        if (lastDot > 0) {
                                afterUpload = afterUpload.substring(0, lastDot);
                        }

                        return afterUpload;
                } catch (Exception e) {
                        System.err.println("Error extracting public_id from URL: " + cloudinaryUrl + " - "
                                        + e.getMessage());
                        return null;
                }
        }

        public void sendAdminMailToLandlord(String email, String subject, String message, MultipartFile file) {
                mailService.sendMail(email, subject, message, file);
        }

        private LandlordResponseDto convertLandlord(User user) {
                if (user == null || user.getProfile() == null)
                        return null;
                return LandlordResponseDto.builder()
                                .id(user.getId())
                                .landlordProfile(
                                                LandlordProfileResponseDto.builder()
                                                                .id(user.getProfile().getId())
                                                                .fullName(user.getProfile().getFullName())
                                                                .email(user.getProfile().getEmail())
                                                                .phoneNumber(user.getProfile().getPhoneNumber())
                                                                .avatar(user.getProfile().getAvatar())
                                                                .build())
                                .build();
        }

        // Code cũ - method không sắp xếp theo khoảng cách
        /*
         * public PaginationRoomInUserResponseDto getAllRoomInUser(int pageNumber, int
         * pageSize, String code) {
         * Pageable pageable = PageRequest.of(pageNumber, pageSize);
         * Page<Room> roomPage = roomJpaRepository.findAllRoomInUser(code, pageable);
         * 
         * List<RoomInUserResponseDto> rooms = roomPage.getContent().stream()
         * .map(room -> RoomInUserResponseDto.builder()
         * .id(room.getId())
         * .title(room.getTitle())
         * .description(room.getDescription())
         * .priceMonth(room.getPrice_month())
         * .area(room.getArea())
         * .postStartDate(room.getPost_start_date())
         * .address(convertAddress(room.getAddress()))
         * .images(convertImages(room.getImages()))
         * .conveniences(convertConveniences(room.getConvenients()))
         * .landlord(convertLandlord(room.getUser()))
         * .build())
         * .collect(Collectors.toList());
         * 
         * return PaginationRoomInUserResponseDto.builder()
         * .data(rooms)
         * .pageNumber(roomPage.getNumber())
         * .pageSize(roomPage.getSize())
         * .totalRecords(roomPage.getTotalElements())
         * .totalPages(roomPage.getTotalPages())
         * .hasNext(roomPage.hasNext())
         * .hasPrevious(roomPage.hasPrevious())
         * .build();
         * }
         */

        // Method mới - không có userId (fallback)
        public PaginationRoomInUserResponseDto getAllRoomInUser(int pageNumber, int pageSize, String code) {
                Pageable pageable = PageRequest.of(pageNumber, pageSize);
                Page<Room> roomPage = roomJpaRepository.findAllRoomInUser(code, pageable);
                System.out.println("🌍 Fallback getAllRoomInUser called - no userId provided");

                List<RoomInUserResponseDto> rooms = roomPage.getContent().stream()
                                .map(room -> RoomInUserResponseDto.builder()
                                                .id(room.getId())
                                                .title(room.getTitle())
                                                .description(room.getDescription())
                                                .priceMonth(room.getPrice_month()) // chú ý đúng tên getter
                                                .area(room.getArea())
                                                .maxPeople(room.getMaxPeople())
                                                .postStartDate(room.getPost_start_date())
                                                .address(convertAddress(room.getAddress()))
                                                .images(convertImages(room.getImages()))
                                                .conveniences(convertConveniences(room.getConvenients()))
                                                .landlord(convertLandlord(room.getUser()))
                                                .build())
                                .collect(Collectors.toList());

                return PaginationRoomInUserResponseDto.builder()
                                .data(rooms)
                                .pageNumber(roomPage.getNumber())
                                .pageSize(roomPage.getSize())
                                .totalRecords(roomPage.getTotalElements())
                                .totalPages(roomPage.getTotalPages())
                                .hasNext(roomPage.hasNext())
                                .hasPrevious(roomPage.hasPrevious())
                                .build();
        }

        // Method mới - có userId để sắp xếp theo khoảng cách địa lý
        public PaginationRoomInUserResponseDto getAllRoomInUserSortedByDistance(int pageNumber, int pageSize,
                        String code, UUID userId) {
                try {
                        Double userLat = null;
                        Double userLng = null;

                        // Lấy tọa độ của user nếu có
                        if (userId != null) {
                                try {
                                        com.ants.ktc.ants_ktc.entities.UserProfile userProfile = profileService
                                                        .getUserProfileEntity(userId);
                                        userLat = userProfile.getSearchLatitude();
                                        userLng = userProfile.getSearchLongitude();
                                        System.out.println("userLat: " + userLat + ", userLng: " + userLng);
                                } catch (Exception e) {
                                        System.err.println("Could not get user coordinates for distance sorting: "
                                                        + e.getMessage());
                                        // Fallback về method cũ nếu không lấy được tọa độ
                                        return getAllRoomInUser(pageNumber, pageSize, code);
                                }
                        }

                        Pageable pageable = PageRequest.of(pageNumber, pageSize);
                        Page<Room> roomPage;

                        // Sử dụng query có sắp xếp theo khoảng cách nếu có tọa độ user
                        if (userLat != null && userLng != null) {
                                roomPage = roomJpaRepository.findAllRoomInUserSortedByDistance(code, userLat, userLng,
                                                pageable);
                        } else {
                                // Fallback về query cơ bản nếu không có tọa độ
                                roomPage = roomJpaRepository.findAllRoomInUser(code, pageable);
                        }

                        List<RoomInUserResponseDto> rooms = roomPage.getContent().stream()
                                        .map(room -> RoomInUserResponseDto.builder()
                                                        .id(room.getId())
                                                        .title(room.getTitle())
                                                        .description(room.getDescription())
                                                        .priceMonth(room.getPrice_month())
                                                        .area(room.getArea())
                                                        .maxPeople(room.getMaxPeople())
                                                        .postStartDate(room.getPost_start_date())
                                                        .address(convertAddress(room.getAddress()))
                                                        .images(convertImages(room.getImages()))
                                                        .conveniences(convertConveniences(room.getConvenients()))
                                                        .landlord(convertLandlord(room.getUser()))
                                                        .build())
                                        .collect(Collectors.toList());

                        return PaginationRoomInUserResponseDto.builder()
                                        .data(rooms)
                                        .pageNumber(roomPage.getNumber())
                                        .pageSize(roomPage.getSize())
                                        .totalRecords(roomPage.getTotalElements())
                                        .totalPages(roomPage.getTotalPages())
                                        .hasNext(roomPage.hasNext())
                                        .hasPrevious(roomPage.hasPrevious())
                                        .build();

                } catch (Exception e) {
                        System.err.println("Error in getAllRoomInUserSortedByDistance: " + e.getMessage());
                        e.printStackTrace();

                        // Fallback về method cơ bản nếu có lỗi
                        return getAllRoomInUser(pageNumber, pageSize, code);
                }
        }

        // Method mới - sắp xếp theo tọa độ trực tiếp (cho user chưa đăng nhập)
        public PaginationRoomInUserResponseDto getAllRoomInUserWithLocation(int pageNumber, int pageSize,
                        String code, Double latitude, Double longitude) {
                try {
                        Pageable pageable = PageRequest.of(pageNumber, pageSize);
                        Page<Room> roomPage;

                        // Sử dụng query có sắp xếp theo khoảng cách nếu có tọa độ
                        if (latitude != null && longitude != null) {
                                roomPage = roomJpaRepository.findAllRoomInUserSortedByDistance(code, latitude,
                                                longitude,
                                                pageable);
                        } else {
                                // Fallback về query cơ bản nếu không có tọa độ
                                roomPage = roomJpaRepository.findAllRoomInUser(code, pageable);
                        }

                        List<RoomInUserResponseDto> rooms = roomPage.getContent().stream()
                                        .map(room -> RoomInUserResponseDto.builder()
                                                        .id(room.getId())
                                                        .title(room.getTitle())
                                                        .description(room.getDescription())
                                                        .priceMonth(room.getPrice_month())
                                                        .area(room.getArea())
                                                        .maxPeople(room.getMaxPeople())
                                                        .postStartDate(room.getPost_start_date())
                                                        .address(convertAddress(room.getAddress()))
                                                        .images(convertImages(room.getImages()))
                                                        .conveniences(convertConveniences(room.getConvenients()))
                                                        .landlord(convertLandlord(room.getUser()))
                                                        .build())
                                        .collect(Collectors.toList());

                        return PaginationRoomInUserResponseDto.builder()
                                        .data(rooms)
                                        .pageNumber(roomPage.getNumber())
                                        .pageSize(roomPage.getSize())
                                        .totalRecords(roomPage.getTotalElements())
                                        .totalPages(roomPage.getTotalPages())
                                        .hasNext(roomPage.hasNext())
                                        .hasPrevious(roomPage.hasPrevious())
                                        .build();

                } catch (Exception e) {
                        System.err.println("Error in getAllRoomInUserWithLocation: " + e.getMessage());
                        e.printStackTrace();

                        // Fallback về method cơ bản nếu có lỗi
                        return getAllRoomInUser(pageNumber, pageSize, code);
                }
        }

        public PaginationRoomInUserResponseDto filterRooms(int pageNumber, int pageSize,
                        FilterRoomRequestDto filterDto) {
                Pageable pageable = PageRequest.of(pageNumber, pageSize);

                Page<FilterBasicProjection> roomPage;

                // Kiểm tra có convenient filter không
                if (filterDto.getListConvenientIds() == null || filterDto.getListConvenientIds().isEmpty()) {
                        // KHÔNG CÓ CONVENIENT FILTER - dùng query cơ bản
                        roomPage = roomJpaRepository.findRoomsWithBasicFilter(
                                        filterDto.getMinPrice(),
                                        filterDto.getMaxPrice(),
                                        filterDto.getMinArea(),
                                        filterDto.getMaxArea(),
                                        filterDto.getProvinceId(),
                                        filterDto.getDistrictId(),
                                        filterDto.getWardId(),
                                        pageable);

                } else {
                        // CÓ CONVENIENT FILTER - dùng 2 bước

                        // Bước 1: Lấy room IDs thỏa mãn convenient requirements
                        List<String> validRoomIdHex = roomJpaRepository.findRoomIdsByConvenientsHex(
                                        filterDto.getListConvenientIds(),
                                        filterDto.getListConvenientIds().size());
                        System.out.println("Raw validRoomIdHex: " + validRoomIdHex);

                        List<UUID> validRoomIds = validRoomIdHex == null ? new ArrayList<>()
                                        : validRoomIdHex.stream()
                                                        .filter(s -> s != null && !s.isBlank())
                                                        .map(s -> {
                                                                try {
                                                                        return UUID.fromString(formatHexToUuid(s));
                                                                } catch (Exception e) {
                                                                        System.out.println("Invalid UUID hex: " + s);
                                                                        return null;
                                                                }
                                                        })
                                                        .filter(u -> u != null)
                                                        .collect(Collectors.toList());

                        System.out.println("Valid Room IDs: " + validRoomIds);

                        if (validRoomIds.isEmpty()) {
                                // Không có room nào thỏa mãn convenient -> trả về empty
                                roomPage = Page.empty(pageable);
                        } else {
                                // Bước 2: Apply các filter khác với valid room IDs
                                roomPage = roomJpaRepository.findRoomsWithBasicFilterAndRoomIds(
                                                filterDto.getMinPrice(),
                                                filterDto.getMaxPrice(),
                                                filterDto.getMinArea(),
                                                filterDto.getMaxArea(),
                                                filterDto.getProvinceId(),
                                                filterDto.getDistrictId(),
                                                filterDto.getWardId(),
                                                validRoomIds,
                                                pageable);
                        }
                }

                // Tối ưu: Load tất cả images một lần thay vì từng room
                List<UUID> roomIds = roomPage.getContent().stream()
                                .map(room -> {
                                        try {
                                                return UUID.fromString(formatHexToUuid(room.getId()));
                                        } catch (Exception e) {
                                                return null;
                                        }
                                })
                                .filter(id -> id != null)
                                .collect(Collectors.toList());

                // Load tất cả images cho các rooms
                Map<UUID, List<ImageResponseDto>> roomImagesMap = new HashMap<>();
                if (!roomIds.isEmpty()) {
                        List<Image> allImages = imageJpaRepository.findByRoomIdIn(roomIds);
                        roomImagesMap = allImages.stream()
                                        .collect(Collectors.groupingBy(
                                                        img -> img.getRoom().getId(),
                                                        Collectors.mapping(
                                                                        img -> ImageResponseDto.builder()
                                                                                        .id(img.getId())
                                                                                        .url(img.getUrl())
                                                                                        .build(),
                                                                        Collectors.toList())));
                }

                // Convert FilterBasicProjection to response DTO (now using flat fields)
                final Map<UUID, List<ImageResponseDto>> finalRoomImagesMap = roomImagesMap;
                List<RoomInUserResponseDto> rooms = roomPage.getContent().stream()
                                .map(room -> {
                                        // Lấy images từ map đã load sẵn
                                        List<ImageResponseDto> images = null;
                                        try {
                                                UUID roomId = UUID.fromString(formatHexToUuid(room.getId()));
                                                images = finalRoomImagesMap.get(roomId);
                                        } catch (Exception e) {
                                                System.err.println("Error getting images for room " + room.getId()
                                                                + ": " + e.getMessage());
                                        }

                                        // Parse conveniences from convenienceString (format: "id1:name1|id2:name2")
                                        List<ConvenientResponseDto> conveniences = null;
                                        if (room.getConvenienceString() != null
                                                        && !room.getConvenienceString().isEmpty()) {
                                                conveniences = Arrays.stream(room.getConvenienceString().split("\\|"))
                                                                .filter(s -> s != null && !s.isEmpty())
                                                                .map(s -> {
                                                                        String[] parts = s.split(":");
                                                                        if (parts.length == 2) {
                                                                                try {
                                                                                        return ConvenientResponseDto
                                                                                                        .builder()
                                                                                                        .id(Long.valueOf(
                                                                                                                        parts[0]))
                                                                                                        .name(parts[1])
                                                                                                        .build();
                                                                                } catch (NumberFormatException e) {
                                                                                        return null;
                                                                                }
                                                                        }
                                                                        return null;
                                                                })
                                                                .filter(c -> c != null)
                                                                .collect(Collectors.toList());
                                        }

                                        return convertFilterProjectionToDto(room, images, conveniences);
                                })
                                .collect(Collectors.toList());

                return PaginationRoomInUserResponseDto.builder()
                                .data(rooms)
                                .pageNumber(roomPage.getNumber())
                                .pageSize(roomPage.getSize())
                                .totalRecords(roomPage.getTotalElements())
                                .totalPages(roomPage.getTotalPages())
                                .hasNext(roomPage.hasNext())
                                .hasPrevious(roomPage.hasPrevious())
                                .build();
        }

        // Helper to convert hex string to UUID format
        private String formatHexToUuid(String hex) {
                return hex.replaceFirst(
                                "(\\w{8})(\\w{4})(\\w{4})(\\w{4})(\\w{12})",
                                "$1-$2-$3-$4-$5");
        }

        // Helper method to convert FilterBasicProjection to RoomInUserResponseDto
        private RoomInUserResponseDto convertFilterProjectionToDto(FilterBasicProjection room,
                        List<ImageResponseDto> images, List<ConvenientResponseDto> conveniences) {
                return RoomInUserResponseDto.builder()
                                .id(room.getId() != null ? UUID.fromString(formatHexToUuid(room.getId())) : null)
                                .title(room.getTitle())
                                .description(room.getDescription())
                                .priceMonth(room.getPriceMonth())
                                .area(room.getArea())
                                .maxPeople(room.getMaxPeople())
                                .postStartDate(room.getPostStartDate())
                                .address(buildAddressFromProjection(room))
                                .images(images)
                                .conveniences(conveniences)
                                .landlord(buildLandlordFromProjection(room))
                                .favoriteCount(room.getFavoriteCount() != null ? room.getFavoriteCount() : 0)
                                .viewCount(room.getViewCount() != null ? room.getViewCount() : 0)
                                .build();
        }

        // Helper method to build AddressResponseDto from FilterBasicProjection
        private AddressResponseDto buildAddressFromProjection(FilterBasicProjection room) {
                return AddressResponseDto.builder()
                                .id(room.getAddressId() != null ? UUID.fromString(formatHexToUuid(room.getAddressId()))
                                                : null)
                                .street(room.getStreet())
                                .ward(WardResponseDto.builder()
                                                .id(room.getWardId() != null ? room.getWardId().longValue() : null)
                                                .name(room.getWardName())
                                                .district(DistrictResponseDto.builder()
                                                                .id(room.getDistrictId() != null
                                                                                ? room.getDistrictId().longValue()
                                                                                : null)
                                                                .name(room.getDistrictName())
                                                                .province(ProvinceResponseDto.builder()
                                                                                .id(room.getProvinceId() != null ? room
                                                                                                .getProvinceId()
                                                                                                .longValue() : null)
                                                                                .name(room.getProvinceName())
                                                                                .build())
                                                                .build())
                                                .build())
                                .build();
        }

        // Helper method to build LandlordResponseDto from FilterBasicProjection
        private LandlordResponseDto buildLandlordFromProjection(FilterBasicProjection room) {
                return LandlordResponseDto.builder()
                                .id(room.getLandlordId() != null
                                                ? UUID.fromString(formatHexToUuid(room.getLandlordId()))
                                                : null)
                                .landlordProfile(LandlordProfileResponseDto.builder()
                                                .id(room.getLandlordProfileId() != null ? UUID.fromString(
                                                                formatHexToUuid(room.getLandlordProfileId())) : null)
                                                .fullName(room.getFullName())
                                                .email(room.getEmail())
                                                .phoneNumber(room.getPhoneNumber())
                                                .avatar(room.getAvatar())
                                                .build())
                                .build();
        }

        public List<RoomRecentResponseDto> findRecentRooms() {
                Pageable pageable = PageRequest.of(0, 8);
                LocalDate sevenDaysAgo = LocalDate.now().minusDays(7);
                java.sql.Date sqlDate = java.sql.Date.valueOf(sevenDaysAgo);
                List<RoomNewProjection> roomProjections = roomJpaRepository.findRecentRooms(sqlDate, pageable);
                return roomProjections.stream()
                                .map(projection -> RoomRecentResponseDto.builder()
                                                .id(UUID.fromString(formatHexToUuid(projection.getId())))
                                                .title(projection.getTitle())
                                                .priceMonth(projection.getPriceMonth())
                                                .postStartDate(projection.getPostStartDate())
                                                .imageUrl(projection.getImageUrl())
                                                .build())
                                .collect(Collectors.toList());

        }

        public List<RoomInMapResponse> findRoomInMapWithRadius(double centerLat, double centerLng, double radiusKm) {
                List<RoomMapProjection> rooms = roomJpaRepository.findRoomInMapWithRadius(centerLat, centerLng,
                                radiusKm);
                return rooms.stream()
                                .map(room -> RoomInMapResponse.builder()
                                                .id(UUID.fromString(formatHexToUuid(room.getId())))
                                                .title(room.getTitle())
                                                .imageUrl(room.getImageUrl())
                                                .area(room.getArea())
                                                .priceMonth(room.getPriceMonth())
                                                .postType(room.getPostType())
                                                .fullAddress(room.getFullAddress())
                                                .lng(room.getLng())
                                                .lat(room.getLat())
                                                .build())
                                .collect(Collectors.toList());
        }

        // Generate unique 8-digit transaction code using timestamp and user ID
        private String generateUniqueTransactionCode(String unusedPrefix, UUID userId) {
                // Use last 4 digits of timestamp for time uniqueness
                long timestamp = System.currentTimeMillis();
                String timestampSuffix = String.valueOf(timestamp).substring(String.valueOf(timestamp).length() - 4);

                // Use 4 digits from user ID hash for user uniqueness
                int userIdHash = Math.abs(userId.toString().hashCode());
                String userIdSuffix = String.format("%04d", userIdHash % 10000);

                // Combine to create 8-digit code (no prefix)
                return timestampSuffix + userIdSuffix;

        }
}