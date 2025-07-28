package com.ants.ktc.ants_ktc.dtos.role;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class RoleResponseDto {
    private Long id;
    private String code;
    private String name;

}
