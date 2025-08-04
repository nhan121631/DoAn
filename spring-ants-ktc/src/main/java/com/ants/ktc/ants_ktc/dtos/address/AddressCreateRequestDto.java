package com.ants.ktc.ants_ktc.dtos.address;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AddressCreateRequestDto {
    private String street;
    private Long wardId;
}
