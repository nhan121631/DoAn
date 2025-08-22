package com.ants.ktc.ants_ktc.dtos.rating;


import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RatingCreateDto {
    private UUID userId;
    private UUID roomId;
    private Integer score;
    private String comment;
}