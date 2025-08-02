package com.ants.ktc.ants_ktc.dtos.post_types;

import java.util.UUID;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class PostTypeJpaUpdateDto {

    private UUID id;

    @NotBlank(message = "Code must not be blank")
    private String code;

    @NotBlank(message = "Name must not be blank")
    @Size(max = 100, message = "Name must be less than 100 characters")
    private String name;

    @NotNull(message = "Price per day must not be null")
    @Min(value = 0, message = "Price per day must be greater than or equal to 0")
    private Double pricePerDay;

    @NotBlank(message = "Description must not be blank")
    @Size(max = 255, message = "Description must be less than 255 characters")
    private String description;
}
