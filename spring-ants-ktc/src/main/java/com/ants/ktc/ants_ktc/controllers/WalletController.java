package com.ants.ktc.ants_ktc.controllers;

import java.util.UUID;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.ants.ktc.ants_ktc.dtos.wallet.WalletResponseDto;
import com.ants.ktc.ants_ktc.services.WalletService;

@RestController
@RequestMapping("/api/wallets")
public class WalletController {

    @Autowired
    private WalletService walletService;

    @GetMapping("/{userId}")
    public WalletResponseDto getWalletByUserId(@PathVariable("userId") UUID userId) {
        return walletService.getWalletByUserId(userId);
    }
}
