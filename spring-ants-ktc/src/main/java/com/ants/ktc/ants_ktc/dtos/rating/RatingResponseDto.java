package com.ants.ktc.ants_ktc.dtos.rating;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RatingResponseDto {
    private UUID id;
    private UUID userId;
    private String userName;
    private String landLordUserName;
    private String avatar;
    private String landLordAvatar;
    private UUID roomId;
    private String roomTitle;
    private Integer score;
    private String comment;
    private String reply;
    private LocalDateTime dateRated;
}
