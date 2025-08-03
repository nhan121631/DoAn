package com.ants.ktc.ants_ktc.dtos.convenient;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ConvenientResponseDto {
    private Long id;
    private String name;
}
