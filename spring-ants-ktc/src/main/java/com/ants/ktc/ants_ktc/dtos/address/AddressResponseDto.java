package com.ants.ktc.ants_ktc.dtos.address;

import java.util.UUID;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class AddressResponseDto {
    private UUID id;
    private String street;
    private WardResponseDto ward;

}
