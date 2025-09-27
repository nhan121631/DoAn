package com.ants.ktc.ants_ktc.dtos.requirement;

import java.util.UUID;

import org.hibernate.validator.constraints.Length;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RequirementRequestRoomDto {

    private UUID idRequirement;

    @NotNull(message = "User ID must not be null")
    private UUID userId;

    @NotNull(message = "Room ID must not be null")
    private UUID roomId;

    @NotNull(message = "Description must not be null")
    @Length(min = 5, message = "Description must be at least 5 characters long")
    @Length(max = 500, message = "Description must not exceed 500 characters")
    private String description;

    private String imageUrl;
}
