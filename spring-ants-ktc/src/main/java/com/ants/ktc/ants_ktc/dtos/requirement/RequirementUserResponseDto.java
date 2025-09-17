package com.ants.ktc.ants_ktc.dtos.requirement;

import java.time.LocalDateTime;
import java.util.UUID;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class RequirementUserResponseDto {
    private UUID id;
    private UUID userId;
    private UUID roomId;
    private String roomTitle;
    private String userName;
    private String email;
    private String description;
    private int status;

    private String imageUrl;

    private LocalDateTime createdDate;

}
