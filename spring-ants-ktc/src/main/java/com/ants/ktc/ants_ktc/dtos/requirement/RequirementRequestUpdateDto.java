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
public class RequirementRequestUpdateDto {

    @NotNull(message = "ID is required")
    private UUID id;

    @NotNull(message = "Description is required")
    @Length(min = 5, message = "Description must be at least 5 characters long")
    @Length(max = 500, message = "Description must not exceed 500 characters")
    private String description;
}
