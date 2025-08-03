package com.ants.ktc.ants_ktc.dtos.wallet;

import java.util.UUID;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Builder
@Data
@AllArgsConstructor
@NoArgsConstructor
public class WalletResponseDto {
    private UUID id;
    private double balance;
    
}
