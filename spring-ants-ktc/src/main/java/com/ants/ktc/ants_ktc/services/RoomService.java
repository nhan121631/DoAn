package com.ants.ktc.ants_ktc.services;

import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import com.ants.ktc.ants_ktc.dtos.address.AddressResponseDto;
import com.ants.ktc.ants_ktc.dtos.address.DistrictResponseDto;
import com.ants.ktc.ants_ktc.dtos.address.ProvinceResponseDto;
import com.ants.ktc.ants_ktc.dtos.address.WardResponseDto;
import com.ants.ktc.ants_ktc.dtos.convenient.ConvenientResponseDto;
import com.ants.ktc.ants_ktc.dtos.image.ImageCreateRequestDto;
import com.ants.ktc.ants_ktc.dtos.image.ImageResponseDto;
import com.ants.ktc.ants_ktc.dtos.room.RoomRequestCreateDto;
import com.ants.ktc.ants_ktc.dtos.room.RoomResponseDto;
import com.ants.ktc.ants_ktc.entities.Convenient;
import com.ants.ktc.ants_ktc.entities.Image;
import com.ants.ktc.ants_ktc.entities.PostType;
import com.ants.ktc.ants_ktc.entities.Room;
import com.ants.ktc.ants_ktc.entities.User;
import com.ants.ktc.ants_ktc.entities.address.Address;
import com.ants.ktc.ants_ktc.entities.address.Ward;
import com.ants.ktc.ants_ktc.repositories.ConvenientsRepository;
import com.ants.ktc.ants_ktc.repositories.PostTypeJpaRepository;
import com.ants.ktc.ants_ktc.repositories.RoomJpaRepository;
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

                User user = userJpaRepository.findById(requestDto.getUserId())
                                .orElseThrow(() -> new IllegalArgumentException("User not found"));
                room.setUser(user);

                // Set địa chỉ
                Address address = new Address();
                address.setStreet(requestDto.getAddress().getStreet());

                Ward ward = wardRepository.findById(requestDto.getAddress().getWardId())
                                .orElseThrow(() -> new RuntimeException("Ward Not Found"));
                address.setWard(ward);
                room.setAddress(address);

                // Set tiện ích (convenients)
                List<Convenient> convenients = convenientJpaRepository.findAllById(requestDto.getConvenientIds());
                if (convenients.size() != requestDto.getConvenientIds().size()) {
                        throw new RuntimeException("Một số Convenient không tồn tại");
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

}
