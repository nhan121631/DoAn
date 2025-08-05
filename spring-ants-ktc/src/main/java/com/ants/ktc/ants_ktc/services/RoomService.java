package com.ants.ktc.ants_ktc.services;

import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
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

        public RoomResponseDto createRoom(List<MultipartFile> files, RoomRequestCreateDto requestDto) {
                Room room = new Room();
                for (MultipartFile file : files) {
                        if (file.isEmpty()) {
                                throw new IllegalArgumentException("File is empty");
                        }
                        try {
                                String fileName = System.currentTimeMillis() + "_" + file.getOriginalFilename();
                                Path filePath = Paths.get("public/uploads/" + fileName);
                                Files.createDirectories(filePath.getParent());
                                Files.write(filePath, file.getBytes());

                                String fileUrl = "/uploads/" + fileName;
                                ImageCreateRequestDto imageDto = new ImageCreateRequestDto();
                                imageDto.setUrl(fileUrl);
                                Image image = new Image();
                                image.setUrl(fileUrl);
                                image.setRoom(room);
                                room.getImages().add(image);

                        } catch (Exception e) {
                                throw new IllegalArgumentException("Failed to save file: " + e.getMessage(), e);
                        }
                }
                room.setTitle(requestDto.getTitle());
                room.setDescription(requestDto.getDescription());
                room.setPrice_month(requestDto.getPriceMonth());
                room.setPrice_deposit(requestDto.getPriceDeposit());
                room.setPost_start_date(requestDto.getPostStartDate());
                room.setPost_end_date(requestDto.getPostEndDate());

                PostType postType = postTypeJpaRepository.findById(requestDto.getTypepostId())
                                .orElseThrow(() -> new IllegalArgumentException("PostType not found"));
                room.setPostType(postType);

                User user = userJpaRepository.findById(requestDto.getUserId())
                                .orElseThrow(() -> new IllegalArgumentException("User not found"));
                room.setUser(user);
                Address address = new Address();
                address.setStreet(requestDto.getAddress().getStreet());
                Ward ward = wardRepository.findById(requestDto.getAddress().getWardId())
                                .orElseThrow(() -> new RuntimeException("Ward Not Found"));
                address.setWard(ward);
                room.setAddress(address);
                for (Long convenientId : requestDto.getConvenientIds()) {
                        Convenient convenientEntity = convenientJpaRepository.findById(convenientId)
                                        .orElseThrow(() -> new RuntimeException("Convenient not found"));
                        room.getConvenients().add(convenientEntity);
                }
                roomJpaRepository.save(room);
                return RoomResponseDto.builder()
                                .id(room.getId())
                                .title(room.getTitle())
                                .description(room.getDescription())
                                .priceMonth(room.getPrice_month())
                                .priceDeposit(room.getPrice_deposit())
                                .postStartDate(room.getPost_start_date())
                                .postEndDate(room.getPost_end_date())
                                .typepost(postType.getName())
                                .userId(requestDto.getUserId())
                                .convenients(room.getConvenients().stream()
                                                .map(convenient -> ConvenientResponseDto.builder()
                                                                .id(convenient.getId())
                                                                .name(convenient.getName())
                                                                .build())
                                                .toList())
                                .images(room.getImages().stream()
                                                .map(image -> ImageResponseDto.builder()
                                                                .id(image.getId())
                                                                .url(image.getUrl())
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
