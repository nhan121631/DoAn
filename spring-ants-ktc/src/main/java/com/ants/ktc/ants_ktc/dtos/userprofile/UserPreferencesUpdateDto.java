package com.ants.ktc.ants_ktc.dtos.userprofile;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserPreferencesUpdateDto {
    private String searchAddress; // Địa chỉ đầy đủ từ frontend
}
