package com.ants.ktc.ants_ktc.services;

import java.util.UUID;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.ants.ktc.ants_ktc.dtos.wallet.WalletResponseDto;
import com.ants.ktc.ants_ktc.repositories.WalletJpaRepository;

@Service
public class WalletService {

    @Autowired
    private WalletJpaRepository walletRepository;

    public WalletResponseDto getWalletByUserId(UUID userId) {
        return walletRepository.findByUserId(userId)
                .map(wallet -> new WalletResponseDto(wallet.getId(), wallet.getBalance()))
                .orElse(new WalletResponseDto(null, 0));
    }
}
