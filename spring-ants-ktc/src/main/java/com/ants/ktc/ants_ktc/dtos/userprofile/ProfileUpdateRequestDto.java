package com.ants.ktc.ants_ktc.dtos.userprofile;

import java.util.UUID;

import com.ants.ktc.ants_ktc.dtos.address.AddressUpdateRequestDto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProfileUpdateRequestDto {

    private UUID id; // Assuming this is the ID of the user profile
    private String fullName;

    @NotBlank(message = "Email is required")
    @Email(message = "Email should be valid")
    private String email;

    @NotBlank(message = "Phone number is required")
    private String phoneNumber;
    private String avatar;
    private String bankName;
    private String binCode;
    private String bankNumber;
    private String accoutHolderName;
    private AddressUpdateRequestDto address;

}
