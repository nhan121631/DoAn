package com.ants.ktc.ants_ktc.services;

import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.time.temporal.ChronoUnit;
import java.util.Date;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import com.ants.ktc.ants_ktc.dtos.address.AddressResponseDto;
import com.ants.ktc.ants_ktc.dtos.address.DistrictResponseDto;
import com.ants.ktc.ants_ktc.dtos.address.ProvinceResponseDto;
import com.ants.ktc.ants_ktc.dtos.address.WardResponseDto;
import com.ants.ktc.ants_ktc.dtos.convenient.ConvenientResponseDto;
import com.ants.ktc.ants_ktc.dtos.image.ImageResponseDto;
import com.ants.ktc.ants_ktc.dtos.room.RoomRequestCreateDto;
import com.ants.ktc.ants_ktc.dtos.room.RoomResponseDto;
import com.ants.ktc.ants_ktc.entities.Convenient;
import com.ants.ktc.ants_ktc.entities.Image;
import com.ants.ktc.ants_ktc.entities.PostType;
import com.ants.ktc.ants_ktc.entities.Room;
import com.ants.ktc.ants_ktc.entities.Transaction;
import com.ants.ktc.ants_ktc.entities.User;
import com.ants.ktc.ants_ktc.entities.address.Address;
import com.ants.ktc.ants_ktc.entities.address.Ward;
import com.ants.ktc.ants_ktc.repositories.ConvenientsRepository;
import com.ants.ktc.ants_ktc.repositories.PostTypeJpaRepository;
import com.ants.ktc.ants_ktc.repositories.RoomJpaRepository;
import com.ants.ktc.ants_ktc.repositories.TransactionsJpaRepository;
import com.ants.ktc.ants_ktc.repositories.UserJpaRepository;
import com.ants.ktc.ants_ktc.repositories.address.WardJpaRepository;

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
                if (totalPrice > balance) {
                        throw new IllegalArgumentException("User does not have enough balance to create this room");
                }

                // *** */
                Date transactionDate = new Date();
                user.getWallet().setBalance(balance - totalPrice);
                userJpaRepository.save(user);

                System.out.println("Diff Date: " + diffDays);

                // transaction
                Transaction transaction = new Transaction();
                transaction.setAmount(-totalPrice);
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

                if (diffDays * postType.getPricePerDay() > user.getWallet().getBalance()) {
                        throw new IllegalArgumentException("User does not have enough balance to create this room");
                }
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
                                .typepost(postType.getName())
                                .userId(user.getId())
                                .convenients(convenients.stream()
                                                .map(c -> ConvenientResponseDto.builder()
                                                                .id(c.getId())
                                                                .name(c.getName())
                                                                .build())
                                                .toList())
                                .images(images.stream()
                                                .map(img -> ImageResponseDto.builder()
                                                                .id(img.getId())
                                                                .url(img.getUrl())
                                                                .build())
                                                .toList())
                                .address(AddressResponseDto.builder()
                                                .id(address.getId())
                                                .street(address.getStreet())
                                                .ward(WardResponseDto.builder()
                                                                .id(ward.getId())
                                                                .name(ward.getName())
                                                                .district(DistrictResponseDto.builder()
                                                                                .id(ward.getDistrict().getId())
                                                                                .name(ward.getDistrict().getName())
                                                                                .province(ProvinceResponseDto.builder()
                                                                                                .id(ward.getDistrict()
                                                                                                                .getProvince()
                                                                                                                .getId())
                                                                                                .name(ward.getDistrict()
                                                                                                                .getProvince()
                                                                                                                .getName())
                                                                                                .build())
                                                                                .build())
                                                                .build())
                                                .build())
                                .build();
        }

        public List<RoomResponseDto> getAllRooms() {
                List<Room> rooms = roomJpaRepository.findAll(); // Lấy tất cả các phòng
                return rooms.stream()
                                .map(this::convertToRoomResponseDto) // Chuyển đổi từng Room sang RoomResponseDto
                                .collect(Collectors.toList());
        }

        private RoomResponseDto convertToRoomResponseDto(Room room) {
                return RoomResponseDto.builder()
                                .id(room.getId())
                                .title(room.getTitle())
                                .description(room.getDescription())
                                .priceMonth(room.getPrice_month())
                                .priceDeposit(room.getPrice_deposit())
                                .postStartDate(room.getPost_start_date())
                                .postEndDate(room.getPost_end_date())
                                .typepost(room.getPostType().getName())
                                .userId(room.getUser().getId())
                                .convenients(room.getConvenients().stream()
                                                .map(convenient -> ConvenientResponseDto.builder()
                                                                .id(convenient.getId())
                                                                .name(convenient.getName())
                                                                .build())
                                                .collect(Collectors.toList()))
                                .images(room.getImages().stream()
                                                .map(image -> ImageResponseDto.builder()
                                                                .id(image.getId())
                                                                .url(image.getUrl())
                                                                .build())
                                                .collect(Collectors.toList()))
                                .address(AddressResponseDto.builder()
                                                .id(room.getAddress().getId())
                                                .street(room.getAddress().getStreet())
                                                .ward(WardResponseDto.builder()
                                                                .id(room.getAddress().getWard().getId())
                                                                .name(room.getAddress().getWard().getName())
                                                                .district(DistrictResponseDto.builder()
                                                                                .id(room.getAddress().getWard()
                                                                                                .getDistrict().getId())
                                                                                .name(room.getAddress().getWard()
                                                                                                .getDistrict()
                                                                                                .getName())
                                                                                .province(ProvinceResponseDto.builder()
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
}
