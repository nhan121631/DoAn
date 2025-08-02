package com.ants.ktc.ants_ktc.dtos.userprofile;

import com.ants.ktc.ants_ktc.dtos.address.AddressResponseDto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserProfileResponseDto {

    private String email;
    private String phoneNumber;
    private String avatar;
    private int isActive;
    private String bankName;
    private String binCode;
    private String bankNumber;
    private String accoutHolderName;
    private AddressResponseDto address;
}
