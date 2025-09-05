package com.ants.ktc.ants_ktc.dtos.userprofile;

import java.util.UUID;

import com.ants.ktc.ants_ktc.dtos.address.AddressUpdateRequestDto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProfileUpdateRequestDto {

    private UUID id;
    @NotBlank(message = "Full name is required")
    private String fullName;

    @NotBlank(message = "Email is required")
    @Email(message = "Email should be valid")
    private String email;

    // @NotBlank(message = "Phone number is required")
    @NotBlank(message = "Phone number is required")
    @Pattern(regexp = "^[0-9]{10,11}$", message = "Phone number must be 10 or 11 digits")
    private String phoneNumber;
    private String avatar;
    private String bankName;
    @Pattern(regexp = "^[0-9]{6,8}$", message = "BIN code must be numeric and between 6 to 8 digits")
    private String binCode;
    @Pattern(regexp = "^[0-9]{8,16}$", message = "Bank number must be between 8 and 16 digits")
    private String bankNumber;
    private String accoutHolderName;
    private AddressUpdateRequestDto address;

}
