package com.ants.ktc.ants_ktc.services;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.ants.ktc.ants_ktc.dtos.rating.RatingCreateDto;
import com.ants.ktc.ants_ktc.dtos.rating.RatingReplyDto;
import com.ants.ktc.ants_ktc.dtos.rating.RatingResponseDto;
import com.ants.ktc.ants_ktc.entities.Rating;
import com.ants.ktc.ants_ktc.entities.Room;
import com.ants.ktc.ants_ktc.entities.User;
import com.ants.ktc.ants_ktc.enums.FeedbackAccess;
import com.ants.ktc.ants_ktc.enums.FeedbackStatus;
import com.ants.ktc.ants_ktc.repositories.BookingJpaRepository;
import com.ants.ktc.ants_ktc.repositories.RatingJpaRepository;
import com.ants.ktc.ants_ktc.repositories.RoomJpaRepository;
import com.ants.ktc.ants_ktc.repositories.UserJpaRepository;

@Service
public class RatingService {
    @Autowired
    private RoomJpaRepository roomJpaRepository;
    @Autowired
    private UserJpaRepository userJpaRepository;
    @Autowired
    private RatingJpaRepository ratingJpaRepository;
    @Autowired
    private BookingJpaRepository bookingJpaRepository;

    public RatingResponseDto createRating(RatingCreateDto dto) {
        User user = userJpaRepository.findById(dto.getUserId())
                .orElseThrow(() -> new RuntimeException("User not found"));
        Room room = roomJpaRepository.findById(dto.getRoomId())
                .orElseThrow(() -> new RuntimeException("Room not found"));

        Rating rating = new Rating();
        rating.setUser(user);
        rating.setRoom(room);
        rating.setScore(dto.getScore());
        rating.setComment(dto.getComment());
        rating.setDateRated(LocalDateTime.now());
        rating.setStatus(FeedbackStatus.NEW);

        Rating saved = ratingJpaRepository.save(rating);
        return mapToResponse(saved);
    }

    public RatingResponseDto replyRating(UUID landlordId, UUID ratingId, RatingReplyDto dto) {
        Rating rating = ratingJpaRepository.findById(ratingId)
                .orElseThrow(() -> new RuntimeException("Rating not found"));

        if (!rating.getRoom().getUser().getId().equals(landlordId)) {
            throw new RuntimeException("Bạn không có quyền reply feedback này");
        }

        rating.setReply(dto.getReply());
        rating.setStatus(FeedbackStatus.REPLIED);

        Rating saved = ratingJpaRepository.save(rating);
        return mapToResponse(saved);
    }

    public List<RatingResponseDto> getAllRatingsByRoom(UUID roomId) {
        return ratingJpaRepository.findAllByRoomIdWithUserAndRoom(roomId)
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public List<RatingResponseDto> getAllRatingsByLandlord(UUID landlordId) {
        return ratingJpaRepository.findAllByLandlordId(landlordId)
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public FeedbackAccess checkUserFeedbackAccess(UUID userId, UUID roomId) {
        boolean hasUsedRoom = bookingJpaRepository.existsByUserIdAndRoomIdAndIsRemoved(userId, roomId, 0);
        if (!hasUsedRoom)
            return FeedbackAccess.NOT_USED;

        boolean alreadyRated = ratingJpaRepository.existsByUserIdAndRoomId(userId, roomId);
        if (alreadyRated)
            return FeedbackAccess.ALREADY_RATED;

        return FeedbackAccess.CAN_RATE;
    }

    public String deleteRating(UUID ratingId, UUID userId) {
        Rating rating = ratingJpaRepository.findById(ratingId)
                .orElseThrow(() -> new RuntimeException("Rating not found"));
        UUID comment_by = rating.getUser().getId();
        UUID landlord = rating.getRoom().getUser().getId();
        if (!comment_by.equals(userId) && !landlord.equals(userId)) {
            throw new RuntimeException("Bạn không có quyền xóa feedback này");
        }
        ratingJpaRepository.deleteById(ratingId);
        return "Feedback removed";
    }

    private RatingResponseDto mapToResponse(Rating rating) {
        return new RatingResponseDto(
                rating.getId(),
                rating.getUser().getId(),
                rating.getUser().getUsername(),
                rating.getRoom().getUser().getUsername(),
                rating.getUser().getProfile().getAvatar(),
                rating.getRoom().getUser().getProfile().getAvatar(),
                rating.getRoom().getId(),
                rating.getRoom().getTitle(),
                rating.getScore(),
                rating.getComment(),
                rating.getReply(),
                rating.getDateRated());
    }
}
