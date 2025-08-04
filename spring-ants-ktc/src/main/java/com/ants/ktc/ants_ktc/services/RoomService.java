package com.ants.ktc.ants_ktc.services;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import com.ants.ktc.ants_ktc.dtos.convenient.ConvenientResponseDto;
import com.ants.ktc.ants_ktc.dtos.image.ImageResponseDto;
import com.ants.ktc.ants_ktc.dtos.post_types.PostTypeResponseDto;
import com.ants.ktc.ants_ktc.dtos.room.RoomRequestDto;
import com.ants.ktc.ants_ktc.dtos.room.RoomResponseDto;
import com.ants.ktc.ants_ktc.entities.Convenient;
import com.ants.ktc.ants_ktc.entities.Image;
import com.ants.ktc.ants_ktc.entities.Room;
import com.ants.ktc.ants_ktc.repositories.ConvenientsRepository;
import com.ants.ktc.ants_ktc.repositories.RoomJpaRepository;

@Service
public class RoomService {
    @Autowired
    private RoomJpaRepository roomJpaRepository;

    @Autowired
    private ConvenientsRepository convenientRepository;

    private RoomResponseDto convertToDto(Room room) {
        return RoomResponseDto.builder()
                .id(room.getId())
                .title(room.getTitle())
                .images(room.getImages() != null
                        ? room.getImages().stream()
                                .map(image -> new ImageResponseDto(image.getId(), image.getUrl()))
                                .collect(Collectors.toList())
                        : new ArrayList<>())
                .description(room.getDescription())
                .priceMonth(room.getPrice_month())
                .priceDeposit(room.getPrice_deposit())
                .available(room.getAvailable())
                .approval(room.getApproval())
                .hidden(room.getHidden())
                .postStartDate(room.getPost_start_date())
                .postEndDate(room.getPost_end_date())
                .convenients(room.getConvenients() != null
                        ? room.getConvenients().stream()
                                .map(convenient -> new ConvenientResponseDto(convenient.getId(), convenient.getName()))
                                .collect(Collectors.toList())
                        : new ArrayList<>())
                .build();
    }

    // Create room
    public RoomResponseDto createRoom(RoomRequestDto requestDto) throws IOException {
        Room room = new Room();
        room.setTitle(requestDto.getTitle());
        room.setDescription(requestDto.getDescription());
        room.setPrice_month(requestDto.getPriceMonth());
        room.setPrice_deposit(requestDto.getPriceDeposit());
        room.setAvailable(requestDto.getAvailable());
        room.setApproval(requestDto.getApproval());
        room.setHidden(requestDto.getHidden());
        room.setPost_start_date(requestDto.getPostStartDate());
        room.setPost_end_date(requestDto.getPostEndDate());

        // Thêm tiện ích
        if (requestDto.getConvenientIds() != null) {
            List<Convenient> convenients = convenientRepository.findAllById(requestDto.getConvenientIds());
            room.setConvenients(convenients);
        }

        // Xử lý ảnh
        List<Image> images = handleRoomImages(requestDto.getImages(), room);
        room.setImages(images);

        Room savedRoom = roomJpaRepository.save(room);
        return convertToDto(savedRoom);
    }

    // Tạo phòng mới và gán cho user
    public RoomResponseDto createRoomByUserId(UUID userId, RoomRequestDto requestDto) throws IOException {
        Room room = new Room();
        room.setTitle(requestDto.getTitle());
        room.setDescription(requestDto.getDescription());
        room.setPrice_month(requestDto.getPriceMonth());
        room.setPrice_deposit(requestDto.getPriceDeposit());
        room.setAvailable(requestDto.getAvailable());
        room.setApproval(requestDto.getApproval());
        room.setHidden(requestDto.getHidden());
        room.setPost_start_date(requestDto.getPostStartDate());
        room.setPost_end_date(requestDto.getPostEndDate());

        // Gắn user cho phòng
        room.setId(userId);

        // Thêm tiện ích
        if (requestDto.getConvenientIds() != null) {
            List<Convenient> convenients = convenientRepository.findAllById(requestDto.getConvenientIds());
            room.setConvenients(convenients);
        }

        // Xử lý ảnh
        List<Image> images = handleRoomImages(requestDto.getImages(), room);
        room.setImages(images);

        Room savedRoom = roomJpaRepository.save(room);
        return convertToDto(savedRoom);
    }

    // Lấy phòng theo id, trả về DTO kèm ảnh và tiện ích
    public RoomResponseDto getRoom(UUID id) {
        Room room = roomJpaRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Room not found"));

        List<ImageResponseDto> imageDtos = room.getImages() != null
                ? room.getImages().stream()
                        .map(image -> new ImageResponseDto(image.getId(), image.getUrl()))
                        .collect(Collectors.toList())
                : new ArrayList<>();

        List<ConvenientResponseDto> convenientDtos = room.getConvenients() != null
                ? room.getConvenients().stream()
                        .map(convenient -> new ConvenientResponseDto(convenient.getId(), convenient.getName()))
                        .collect(Collectors.toList())
                : new ArrayList<>();

        PostTypeResponseDto postTypeDto = null;
        if (room.getPostType() != null) {
            postTypeDto = PostTypeResponseDto.builder()
                    .id(room.getPostType().getId())
                    .code(room.getPostType().getCode())
                    .name(room.getPostType().getName())
                    .pricePerDay(room.getPostType().getPricePerDay())
                    .description(room.getPostType().getDescription())
                    .build();
        }

        return RoomResponseDto.builder()
                .id(room.getId())
                .title(room.getTitle())
                .description(room.getDescription())
                .priceMonth(room.getPrice_month())
                .priceDeposit(room.getPrice_deposit())
                .available(room.getAvailable())
                .approval(room.getApproval())
                .hidden(room.getHidden())
                .postStartDate(room.getPost_start_date())
                .postEndDate(room.getPost_end_date())
                .images(imageDtos)
                .convenients(convenientDtos)
                .postType(postTypeDto)
                .build();
    }

    // Hàm lưu file ảnh
    private String saveFile(MultipartFile file) throws IOException {
        String fileName = System.currentTimeMillis() + "_" + file.getOriginalFilename();
        Path filePath = Paths.get("public/uploads/" + fileName);
        Files.createDirectories(filePath.getParent());
        Files.write(filePath, file.getBytes());
        return "/uploads/" + fileName;
    }

    private List<Image> handleRoomImages(List<MultipartFile> files, Room room) throws IOException {
        List<Image> images = new ArrayList<>();
        if (files != null) {
            for (MultipartFile file : files) {
                if (file != null && !file.isEmpty()) {
                    String url = saveFile(file);
                    Image image = new Image();
                    image.setUrl(url);
                    image.setRoom(room);
                    images.add(image);
                }
            }
        }
        return images;
    }

}
