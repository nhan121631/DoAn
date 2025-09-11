package com.ants.ktc.ants_ktc.services;

import com.ants.ktc.ants_ktc.dtos.address.AddressResponseDto;
import com.ants.ktc.ants_ktc.dtos.address.DistrictResponseDto;
import com.ants.ktc.ants_ktc.dtos.address.ProvinceResponseDto;
import com.ants.ktc.ants_ktc.dtos.address.WardResponseDto;
import com.ants.ktc.ants_ktc.dtos.convenient.ConvenientResponseDto;
import com.ants.ktc.ants_ktc.dtos.favorite.FavoriteRoomProjection;
import com.ants.ktc.ants_ktc.dtos.image.ImageResponseDto;
import com.ants.ktc.ants_ktc.dtos.user.LandlordResponseDto;
import com.ants.ktc.ants_ktc.dtos.userprofile.LandlordProfileResponseDto;
import com.ants.ktc.ants_ktc.entities.Favorite;
import com.ants.ktc.ants_ktc.entities.Room;
import com.ants.ktc.ants_ktc.entities.User;
import com.ants.ktc.ants_ktc.repositories.FavoriteJpaRepository;
import com.ants.ktc.ants_ktc.repositories.RoomJpaRepository;
import com.ants.ktc.ants_ktc.repositories.UserJpaRepository;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Date;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class FavoriteService {

        private final FavoriteJpaRepository favoriteJpaRepository;
        private final UserJpaRepository userJpaRepository;
        private final RoomJpaRepository roomJpaRepository;

        public FavoriteService(FavoriteJpaRepository favoriteJpaRepository,
                        UserJpaRepository userJpaRepository,
                        RoomJpaRepository roomJpaRepository) {
                this.favoriteJpaRepository = favoriteJpaRepository;
                this.userJpaRepository = userJpaRepository;
                this.roomJpaRepository = roomJpaRepository;
        }

        @Transactional
        public void addFavoriteRoom(String username, UUID roomId) {
                User user = userJpaRepository.findByUsername(username)
                                .orElseThrow(() -> new EntityNotFoundException(
                                                "User not found with username: " + username));
                Room room = roomJpaRepository.findById(roomId)
                                .orElseThrow(() -> new EntityNotFoundException("Room not found with id: " + roomId));

                if (favoriteJpaRepository.existsByUserIdAndRoomId(user.getId(), roomId)) {
                        return;
                }

                Favorite favorite = new Favorite();
                favorite.setUser(user);
                favorite.setRoom(room);
                favorite.setCreatedDate(new Date());
                favoriteJpaRepository.save(favorite);
        }

        @Transactional
        public void removeFavoriteRoom(String username, UUID roomId) {
                User user = userJpaRepository.findByUsername(username)
                                .orElseThrow(() -> new EntityNotFoundException(
                                                "User not found with username: " + username));

                if (!favoriteJpaRepository.existsByUserIdAndRoomId(user.getId(), roomId)) {
                        return;
                }
                favoriteJpaRepository.deleteByUserIdAndRoomId(user.getId(), roomId);
        }

        @Transactional(readOnly = true)
        public Page<FavoriteRoomProjection> findAllFavoriteRooms(int page, int size) {
                String username = SecurityContextHolder.getContext().getAuthentication().getName();

                User user = userJpaRepository.findByUsername(username)
                                .orElseThrow(() -> new EntityNotFoundException(
                                                "User not found with username: " + username));

                Pageable pageable = PageRequest.of(page, size);

                Page<Favorite> favoritesPage = favoriteJpaRepository.findByUserIdWithRoom(user.getId(), pageable);

                List<FavoriteRoomProjection> favoriteRooms = favoritesPage.getContent().stream()
                                .map(this::mapToFavoriteRoomProjection)
                                .collect(Collectors.toList());

                return new PageImpl<>(favoriteRooms, pageable, favoritesPage.getTotalElements());
        }

        // tăng lượt yt
        public long countFavoriteByRoom(UUID roomId) {
                return favoriteJpaRepository.countByRoomId(roomId);
        }

        private FavoriteRoomProjection mapToFavoriteRoomProjection(Favorite favorite) {
                Room room = favorite.getRoom();
                long favoriteCount = favoriteJpaRepository.countByRoomId(room.getId());

                String postTypeName = null;
                if (room.getPostType() != null) {
                        postTypeName = room.getPostType().getName(); // "Post VIP" hoặc "Post Normal"
                }

                return FavoriteRoomProjection.builder()
                                .id(room.getId())
                                .title(room.getTitle())
                                .description(room.getDescription())
                                .priceMonth(room.getPrice_month())
                                .area(room.getArea())
                                .postStartDate(room.getPost_start_date())
                                .address(
                                                AddressResponseDto.builder()
                                                                .id(room.getAddress().getId())
                                                                .street(room.getAddress().getStreet())
                                                                // Fix: Xây dựng đối tượng WardResponseDto hoàn chỉnh
                                                                .ward(
                                                                                WardResponseDto.builder()
                                                                                                .id(room.getAddress()
                                                                                                                .getWard()
                                                                                                                .getId())
                                                                                                .name(room.getAddress()
                                                                                                                .getWard()
                                                                                                                .getName())
                                                                                                .district(
                                                                                                                DistrictResponseDto
                                                                                                                                .builder()
                                                                                                                                .id(room.getAddress()
                                                                                                                                                .getWard()
                                                                                                                                                .getDistrict()
                                                                                                                                                .getId())
                                                                                                                                .name(room.getAddress()
                                                                                                                                                .getWard()
                                                                                                                                                .getDistrict()
                                                                                                                                                .getName())
                                                                                                                                .province(
                                                                                                                                                ProvinceResponseDto
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
                                .images(
                                                room.getImages().stream()
                                                                .map(image -> ImageResponseDto.builder()
                                                                                .id(image.getId())
                                                                                .url(image.getUrl())
                                                                                .build())
                                                                .collect(Collectors.toList()))
                                .conveniences(
                                                room.getConvenients().stream()
                                                                .map(convenience -> ConvenientResponseDto.builder()
                                                                                .id(convenience.getId())
                                                                                .name(convenience.getName())
                                                                                .build())
                                                                .collect(Collectors.toList()))
                                .landlord(
                                                // Fix: Ánh xạ vào LandlordProfileResponseDto bên trong
                                                // LandlordResponseDto
                                                LandlordResponseDto.builder()
                                                                .id(room.getUser().getId())
                                                                .landlordProfile(
                                                                                LandlordProfileResponseDto.builder()
                                                                                                .id(room.getUser()
                                                                                                                .getProfile()
                                                                                                                .getId())
                                                                                                .fullName(room.getUser()
                                                                                                                .getProfile()
                                                                                                                .getFullName())
                                                                                                .phoneNumber(room
                                                                                                                .getUser()
                                                                                                                .getProfile()
                                                                                                                .getPhoneNumber())
                                                                                                .avatar(room.getUser()
                                                                                                                .getProfile()
                                                                                                                .getAvatar())
                                                                                                .build())
                                                                .build())
                                .favoriteCount(favoriteCount)
                                // .favoriteCount(favoriteJpaRepository.countByRoomId(room.getId()))

                                .postType(postTypeName)
                                .build();
        }
}