package com.ants.ktc.ants_ktc.dtos.auth;

import jakarta.validation.constraints.NotEmpty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class GoogleLoginRequestDto {
    @NotEmpty(message = "Credential cannot be empty")
    private String credential;
}
