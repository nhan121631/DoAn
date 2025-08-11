package com.ants.ktc.ants_ktc.services;

import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import com.ants.ktc.ants_ktc.dtos.address.AddressResponseDto;
import com.ants.ktc.ants_ktc.dtos.address.DistrictResponseDto;
import com.ants.ktc.ants_ktc.dtos.address.ProvinceResponseDto;
import com.ants.ktc.ants_ktc.dtos.address.WardResponseDto;
import com.ants.ktc.ants_ktc.dtos.convenient.ConvenientResponseDto;
import com.ants.ktc.ants_ktc.dtos.image.ImageResponseDto;
import com.ants.ktc.ants_ktc.dtos.room.PaginationRoomAdminResponseDto;
import com.ants.ktc.ants_ktc.dtos.room.PaginationRoomInUserResponseDto;
import com.ants.ktc.ants_ktc.dtos.room.PaginationRoomResponseDto;
import com.ants.ktc.ants_ktc.dtos.room.RoomAdminResponseProjectionDto;
import com.ants.ktc.ants_ktc.dtos.room.RoomInUserResponseDto;
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
import com.ants.ktc.ants_ktc.repositories.ConvenientsRepository;
import com.ants.ktc.ants_ktc.repositories.ImageJpaRepository;
import com.ants.ktc.ants_ktc.repositories.PostTypeJpaRepository;
import com.ants.ktc.ants_ktc.repositories.RoomJpaRepository;
import com.ants.ktc.ants_ktc.repositories.TransactionsJpaRepository;
import com.ants.ktc.ants_ktc.repositories.UserJpaRepository;
import com.ants.ktc.ants_ktc.repositories.address.WardJpaRepository;
import com.ants.ktc.ants_ktc.repositories.projection.RoomByAdminPagingProjection;
import com.ants.ktc.ants_ktc.repositories.projection.RoomByLandlordPagingProjection;

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
                return conveniences.stream()
                                .map(conv -> ConvenientResponseDto.builder()
                                                .id(conv.getId())
                                                .name(conv.getName())
                                                .build())
                                .collect(Collectors.toList());
        }

        @Transactional
        public RoomResponseDto createRoom(List<MultipartFile> files, RoomRequestCreateDto requestDto) {
                Room room = new Room();

                // Set các thuộc tính cơ bản
                room.setTitle(requestDto.getTitle());
                room.setDescription(requestDto.getDescription());
                room.setPrice_month(requestDto.getPriceMonth());
                room.setPrice_deposit(requestDto.getPriceDeposit());
                room.setPost_start_date(requestDto.getPostStartDate());
                room.setPost_end_date(requestDto.getPostEndDate());
                room.setArea(requestDto.getArea());

                // Lấy PostType và User
                PostType postType = postTypeJpaRepository.findById(requestDto.getTypepostId())
                                .orElseThrow(() -> new IllegalArgumentException("PostType not found"));
                room.setPostType(postType);

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

                // Tạo mã giao dịch
                LocalDateTime now = LocalDateTime.now(ZoneId.systemDefault());
                String day = String.format("%02d", now.getDayOfMonth());
                String hour = String.format("%02d", now.getHour());
                String random = String.format("%04d", (int) (Math.random() * 10000));
                String transactionCode = day + hour + random;
                transaction.setTransactionCode(transactionCode);

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
                room.setAddress(address);

                // Set tiện ích (convenients)
                List<Convenient> convenients = convenientJpaRepository.findAllById(requestDto.getConvenientIds());
                if (convenients.size() != requestDto.getConvenientIds().size()) {
                        throw new IllegalArgumentException("Convenients not found");
                }
                room.setConvenients(convenients);

                // Xử lý images
                List<Image> images = files.stream()
                                .filter(file -> file != null && !file.isEmpty())
                                .map(file -> {
                                        try {
                                                String fileName = System.currentTimeMillis() + "_"
                                                                + file.getOriginalFilename();
                                                Path filePath = Paths.get("public/uploads/" + fileName);
                                                Files.createDirectories(filePath.getParent());
                                                Files.write(filePath, file.getBytes());

                                                String fileUrl = "/uploads/" + fileName;
                                                Image image = new Image();
                                                image.setUrl(fileUrl);
                                                image.setRoom(room); // quan hệ 2 chiều
                                                return image;
                                        } catch (Exception e) {
                                                throw new RuntimeException("Failed to save file: " + e.getMessage(), e);
                                        }
                                })
                                .toList();
                room.setImages(images);

                // Lưu phòng
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

                // 1. Cập nhật thông tin cơ bản
                room.setTitle(request.getTitle());
                room.setDescription(request.getDescription());
                room.setPrice_month(request.getPriceMonth());
                room.setPrice_deposit(request.getPriceDeposit());
                room.setArea(request.getArea());

                // Set địa chỉ
                Address address = room.getAddress();
                if (address == null) {
                        address = new Address();
                }
                address.setStreet(request.getAddress().getStreet());
                Ward ward = wardRepository.findById(request.getAddress().getWardId())
                                .orElseThrow(() -> new IllegalArgumentException("Ward Not Found"));
                address.setWard(ward);
                room.setAddress(address);

                // Set tiện ích (convenients)
                List<Convenient> convenients = convenientJpaRepository.findAllById(request.getConvenientIds());
                if (convenients.size() != request.getConvenientIds().size()) {
                        throw new IllegalArgumentException("Convenients not found");
                }
                room.setConvenients(convenients);

                // Xử lý cập nhật ảnh
                // 1. Lấy danh sách ảnh cũ
                List<Image> oldImages = imageJpaRepository.findByRoomId(id);
                List<Image> imagesToKeep = new ArrayList<>();

                if (request.getExistingImages() != null) {
                        // Xóa các ảnh nằm trong existingImages, giữ lại phần còn lại
                        List<String> existingImageUrls = request.getExistingImages();
                        for (Image img : oldImages) {
                                if (existingImageUrls.contains(img.getUrl())) {
                                        imageJpaRepository.delete(img);
                                        deleteFileFromStorage(img.getUrl());
                                } else {
                                        imagesToKeep.add(img);
                                }
                        }
                } else {
                        // Nếu null => giữ nguyên toàn bộ ảnh cũ
                        imagesToKeep.addAll(oldImages);
                }

                // Thêm ảnh mới
                if (images != null && !images.isEmpty()) {
                        for (MultipartFile file : images) {
                                if (!file.isEmpty()) {
                                        String fileName = System.currentTimeMillis() + "_" + file.getOriginalFilename();
                                        Path filePath = Paths.get("public/uploads/" + fileName);
                                        Files.createDirectories(filePath.getParent());
                                        Files.write(filePath, file.getBytes());
                                        String fileUrl = "/uploads/" + fileName;

                                        Image image = new Image();
                                        image.setRoom(room);
                                        image.setUrl(fileUrl);
                                        imageJpaRepository.save(image);
                                        imagesToKeep.add(image);
                                }
                        }
                }

                // Cập nhật danh sách ảnh vào room
                room.setImages(imagesToKeep);

                List<Image> updatedImages = imagesToKeep;

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

                Pageable pageable = PageRequest.of(page, size);

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
        public PaginationRoomAdminResponseDto getAllRoomByAdminPaginated(int page, int size) {
                Pageable pageable = PageRequest.of(page, size);
                Page<RoomByAdminPagingProjection> roomPage = roomJpaRepository.findAllByAdmin(pageable);

                List<RoomAdminResponseProjectionDto> roomDtos = roomPage.getContent().stream()
                                .map(this::convert2ToDto)
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
                LocalDateTime now = LocalDateTime.now(ZoneId.systemDefault());
                String day = String.format("%02d", now.getDayOfMonth());
                String hour = String.format("%02d", now.getHour());
                String random = String.format("%04d", (int) (Math.random() * 10000));
                String transactionCode = day + hour + random;
                transaction.setTransactionCode(transactionCode);
                transaction.setBankTransactionName("Ants Wallet");
                transaction.setStatus(1); // 1: thành công
                transaction.setWallet(user.getWallet());
                transactionsJpaRepository.save(transaction);

                room.setPost_start_date(newStartDate);
                room.setPost_end_date(newEndDate);
                roomJpaRepository.save(room);

                // Trả về DTO
                return RoomUpdateExpireDateResponseDto.builder()
                                .postStartDate(newStartDate)
                                .postEndDate(newEndDate)
                                .message("Room post updated successfully").build();
        }

        public RoomShowHideProjectionDto updateHidden(UUID roomId, RoomShowHideProjectionDto hidden) {
                Room room = roomJpaRepository.findForExtendById(roomId)
                                .orElseThrow(() -> new IllegalArgumentException("Room not found"));

                room.setHidden(hidden.getIsHidden());
                roomJpaRepository.save(room);

                return RoomShowHideProjectionDto.builder()
                                // .id(room.getId())
                                .isHidden(room.getHidden())
                                .message("Room visibility updated successfully"
                                                + (room.getHidden() == 1 ? " (hidden)" : " (visible)"))
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
                                .postEndDate(room.getPost_end_date())
                                .typepost(room.getPostType().getName())
                                .userId(room.getUser().getId())
                                .convenients(room.getConvenients().stream()
                                                .map(c -> ConvenientResponseDto.builder()
                                                                .id(c.getId())
                                                                .name(c.getName())
                                                                .build())
                                                .toList())
                                .images(convertImages(room.getImages()))
                                .address(convertAddress(room.getAddress()))
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
                                .priceMonth(room.getPrice_month())
                                .priceDeposit(room.getPrice_deposit())
                                .postStartDate(room.getPost_start_date())
                                .postEndDate(room.getPost_end_date())
                                .typepost(room.getPostType() == null ? null : room.getPostType().getName())
                                .address(room.getAddress() == null ? null
                                                : AddressResponseDto.builder()
                                                                .id(room.getAddress().getId())
                                                                .street(room.getAddress().getStreet())
                                                                .ward(room.getAddress().getWard() == null ? null
                                                                                : WardResponseDto.builder()
                                                                                                .id(room.getAddress()
                                                                                                                .getWard()
                                                                                                                .getId())
                                                                                                .name(room.getAddress()
                                                                                                                .getWard()
                                                                                                                .getName())
                                                                                                .district(room.getAddress()
                                                                                                                .getWard()
                                                                                                                .getDistrict() == null
                                                                                                                                ? null
                                                                                                                                : DistrictResponseDto
                                                                                                                                                .builder()
                                                                                                                                                .id(room.getAddress()
                                                                                                                                                                .getWard()
                                                                                                                                                                .getDistrict()
                                                                                                                                                                .getId())
                                                                                                                                                .name(room.getAddress()
                                                                                                                                                                .getWard()
                                                                                                                                                                .getDistrict()
                                                                                                                                                                .getName())
                                                                                                                                                .province(room.getAddress()
                                                                                                                                                                .getWard()
                                                                                                                                                                .getDistrict()
                                                                                                                                                                .getProvince() == null
                                                                                                                                                                                ? null
                                                                                                                                                                                : ProvinceResponseDto
                                                                                                                                                                                                .builder()
                                                                                                                                                                                                .id(room.getAddress()
                                                                                                                                                                                                                .getWard()
                                                                                                                                                                                                                .getDistrict()
                                                                                                                                                                                                                .getProvince()
                                                                                                                                                                                                                .getId())
                                                                                                                                                                                                .name(room.getAddress()
                                                                                                                                                                                                                .getWard()
                                                                                                                                                                                                                .getDistrict()
                                                                                                                                                                                                                .getProvince()
                                                                                                                                                                                                                .getName())
                                                                                                                                                                                                .build())
                                                                                                                                                .build())
                                                                                                .build())
                                                                .build())
                                .build();
        }

        // converter room pagin find by user id
        public RoomAdminResponseProjectionDto convert2ToDto(RoomByAdminPagingProjection room) {
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
                                .address(room.getAddress() == null ? null
                                                : AddressResponseDto.builder()
                                                                .id(room.getAddress().getId())
                                                                .street(room.getAddress().getStreet())
                                                                .ward(room.getAddress().getWard() == null ? null
                                                                                : WardResponseDto.builder()
                                                                                                .id(room.getAddress()
                                                                                                                .getWard()
                                                                                                                .getId())
                                                                                                .name(room.getAddress()
                                                                                                                .getWard()
                                                                                                                .getName())
                                                                                                .district(room.getAddress()
                                                                                                                .getWard()
                                                                                                                .getDistrict() == null
                                                                                                                                ? null
                                                                                                                                : DistrictResponseDto
                                                                                                                                                .builder()
                                                                                                                                                .id(room.getAddress()
                                                                                                                                                                .getWard()
                                                                                                                                                                .getDistrict()
                                                                                                                                                                .getId())
                                                                                                                                                .name(room.getAddress()
                                                                                                                                                                .getWard()
                                                                                                                                                                .getDistrict()
                                                                                                                                                                .getName())
                                                                                                                                                .province(room.getAddress()
                                                                                                                                                                .getWard()
                                                                                                                                                                .getDistrict()
                                                                                                                                                                .getProvince() == null
                                                                                                                                                                                ? null
                                                                                                                                                                                : ProvinceResponseDto
                                                                                                                                                                                                .builder()
                                                                                                                                                                                                .id(room.getAddress()
                                                                                                                                                                                                                .getWard()
                                                                                                                                                                                                                .getDistrict()
                                                                                                                                                                                                                .getProvince()
                                                                                                                                                                                                                .getId())
                                                                                                                                                                                                .name(room.getAddress()
                                                                                                                                                                                                                .getWard()
                                                                                                                                                                                                                .getDistrict()
                                                                                                                                                                                                                .getProvince()
                                                                                                                                                                                                                .getName())
                                                                                                                                                                                                .build())
                                                                                                                                                .build())
                                                                                                .build())
                                                                .build())
                                .build();
        }

        private void deleteFileFromStorage(String fileUrl) {
                try {
                        if (fileUrl != null && fileUrl.startsWith("/uploads/")) {
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

        public PaginationRoomInUserResponseDto getAllRoomInUser(int pageNumber, int pageSize, String code) {
                Pageable pageable = PageRequest.of(pageNumber, pageSize);
                Page<Room> roomPage = roomJpaRepository.findAllRoomInUser(code, pageable);

                List<RoomInUserResponseDto> rooms = roomPage.getContent().stream()
                                .map(room -> RoomInUserResponseDto.builder()
                                                .id(room.getId())
                                                .title(room.getTitle())
                                                .description(room.getDescription())
                                                .priceMonth(room.getPrice_month()) // chú ý đúng tên getter
                                                .area(room.getArea())
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

}