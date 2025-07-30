package com.ants.ktc.ants_ktc.dtos.post_types;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Min;

import lombok.Data;

@Data
public class PostTypeJpaCreateDto {
    @NotBlank
    private String code;
    
    @NotBlank
    @Size(max = 100)
    private String name;

    @NotNull
    @Min(0)
    private Double pricePerDay;
}