package com.ants.ktc.ants_ktc.dtos.post_types;

import java.util.UUID;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class PostTypeResponseDto {
    private UUID id;
    private String code;
    private String name;
    private Double pricePerDay;
    private String description;

}
