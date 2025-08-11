package com.ants.ktc.ants_ktc.dtos.manage_account;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class RoleUpdateRequestDto {
    private List<String> roleNames;
}