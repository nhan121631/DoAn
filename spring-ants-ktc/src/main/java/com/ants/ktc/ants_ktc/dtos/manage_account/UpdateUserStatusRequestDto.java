package com.ants.ktc.ants_ktc.dtos.manage_account;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UpdateUserStatusRequestDto {
    private int status; // 0 = Active, 1 = Disabled
}