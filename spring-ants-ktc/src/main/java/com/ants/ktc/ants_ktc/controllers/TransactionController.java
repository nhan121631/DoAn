package com.ants.ktc.ants_ktc.controllers;

import java.util.List;
import java.util.UUID;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.ants.ktc.ants_ktc.dtos.transaction.CreateTransactionRequestDto;
import com.ants.ktc.ants_ktc.dtos.transaction.PaginationTransactionResponseDto;
import com.ants.ktc.ants_ktc.dtos.transaction.TransactionResponseDto;
import com.ants.ktc.ants_ktc.services.TransactionService;

@RestController
@RequestMapping("/api/transactions")
public class TransactionController {
    private final TransactionService transactionService;

    public TransactionController(TransactionService transactionService) {
        this.transactionService = transactionService;
    }

    // @PostMapping()
    // public ResponseEntity<TransactionResponseDto> createTransaction(@RequestBody
    // CreateTransactionRequestDto requestDto) {
    // TransactionResponseDto savedTransaction =
    // transactionService.createTransaction(requestDto);
    // return ResponseEntity.ok(savedTransaction);
    // }

    @GetMapping("/by-user/{userId}/paging")
    public ResponseEntity<PaginationTransactionResponseDto> getTransactionsByUserIdPaginated(
            @PathVariable("userId") UUID userId,
            @RequestParam(value = "page", defaultValue = "0") int page,
            @RequestParam(value = "size", defaultValue = "8") int size) {
        PaginationTransactionResponseDto responseDto = transactionService.getTransactionsByUserIdPaginated(userId, page, size);
        return new ResponseEntity<>(responseDto, HttpStatus.OK);
    }

    @GetMapping("/{userId}")
    public ResponseEntity<List<TransactionResponseDto>> getAllTransactionByUserId(@PathVariable("userId") UUID userId) {
        List<TransactionResponseDto> transactions = transactionService.getAllTransactionsByUserId(userId);
        return new ResponseEntity<>(transactions, HttpStatus.OK);
    }

    @PostMapping("/{userId}")
    public ResponseEntity<TransactionResponseDto> createTransactionByUserId(
            @PathVariable("userId") UUID userId,
            @RequestBody CreateTransactionRequestDto requestDto) {
        TransactionResponseDto savedTransaction = transactionService.createTransactionByUserId(userId, requestDto);
        return new ResponseEntity<>(savedTransaction, HttpStatus.CREATED);
    }



}
