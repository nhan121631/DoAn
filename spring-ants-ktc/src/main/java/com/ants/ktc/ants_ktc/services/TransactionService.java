package com.ants.ktc.ants_ktc.services;

import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.ants.ktc.ants_ktc.dtos.transaction.CreateTransactionRequestDto;
import com.ants.ktc.ants_ktc.dtos.transaction.PaginationTransactionResponseDto;
import com.ants.ktc.ants_ktc.dtos.transaction.TransactionResponseDto;
import com.ants.ktc.ants_ktc.dtos.wallet.WalletResponseDto;
import com.ants.ktc.ants_ktc.entities.Transaction;
import com.ants.ktc.ants_ktc.entities.User;
import com.ants.ktc.ants_ktc.entities.Wallet;
import com.ants.ktc.ants_ktc.repositories.TransactionsJpaRepository;
import com.ants.ktc.ants_ktc.repositories.UserJpaRepository;
import com.ants.ktc.ants_ktc.repositories.WalletJpaRepository;

import jakarta.transaction.Transactional;

@Service
public class TransactionService {
    @Autowired
    private TransactionsJpaRepository transactionsJpaRepository;

    @Autowired
    private UserJpaRepository userRepository;

    @Autowired
    private WalletJpaRepository walletRepository;

    public TransactionResponseDto convertToDto(Transaction transaction) {
        Wallet wallet = transaction.getWallet();
        WalletResponseDto walletDto = null;
        if (wallet != null) {
            walletDto = WalletResponseDto.builder()
                    .id(wallet.getId())
                    .balance(wallet.getBalance())
                    .build();
        }
        return TransactionResponseDto.builder()
                .amount(transaction.getAmount())
                .transactionType(transaction.getTransactionType())
                .bankTransactionName(transaction.getBankTransactionName())
                .transactionCode(transaction.getTransactionCode())
                .transactionDate(transaction.getTransactionDate())
                .status(transaction.getStatus())
                .description(transaction.getDescription())
                .wallet(walletDto)
                .build();
    }

    // Lấy tất cả transaction của user
    public List<TransactionResponseDto> getAllTransactionsByUserId(UUID userId) {
        List<Transaction> transactions = transactionsJpaRepository
                .findAllTransactionsByUserIdWithWallet(userId);

        return transactions.stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    @Transactional
    public TransactionResponseDto createTransactionByUserId(UUID userId, CreateTransactionRequestDto requestDto) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        Wallet wallet = user.getWallet();
        if (wallet == null) {
            wallet = new Wallet();
            wallet.setUser(user);
            wallet.setBalance(0.0);
            wallet = walletRepository.save(wallet);
            user.setWallet(wallet);
            userRepository.save(user);
        }

        wallet.setBalance(wallet.getBalance() + requestDto.getAmount());
        walletRepository.save(wallet);

        Transaction transaction = new Transaction();
        transaction.setAmount(requestDto.getAmount());
        transaction.setTransactionType(requestDto.getTransactionType());
        transaction.setBankTransactionName(requestDto.getBankTransactionName());
        transaction.setTransactionCode(requestDto.getTransactionCode());
        transaction.setTransactionDate(requestDto.getTransactionDate());
        transaction.setDescription(requestDto.getDescription());
        transaction.setStatus(requestDto.getStatus());
        transaction.setWallet(wallet);

        Transaction savedTransaction = transactionsJpaRepository.save(transaction);

        return transactionsJpaRepository.findWithWalletById(savedTransaction.getId())
                .map(this::convertToDto)
                .orElse(convertToDto(savedTransaction));
    }

    // Phân trang cho transaction theo userId
    public PaginationTransactionResponseDto getTransactionsByUserIdPaginated(UUID userId, int page, int size) {
        Pageable pageable = PageRequest.of(page, size);

        // Lấy dữ liệu phân trang từ repository theo userId
        Page<Transaction> transactionPage = transactionsJpaRepository.findAllByUserId(userId, pageable);

        List<TransactionResponseDto> transactionDtos = transactionPage.getContent().stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());

        return PaginationTransactionResponseDto.builder()
                .transactions(transactionDtos)
                .pageNumber(transactionPage.getNumber())
                .pageSize(transactionPage.getSize())
                .totalRecords(transactionPage.getTotalElements())
                .totalPages(transactionPage.getTotalPages())
                .hasNext(transactionPage.hasNext())
                .hasPrevious(transactionPage.hasPrevious())
                .build();
    }

    // Service
    public PaginationTransactionResponseDto getTransactionsByUserIdAndDateRange(UUID userId, int page, int size,
            String startDateStr, String endDateStr) {
        Date startDate = null;
        Date endDate = null;
        SimpleDateFormat sdfFull = new SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss");
        SimpleDateFormat sdfDate = new SimpleDateFormat("yyyy-MM-dd");
        try {
            try {
                startDate = sdfFull.parse(startDateStr);
            } catch (ParseException e) {
                startDate = sdfDate.parse(startDateStr);
            }
            try {
                endDate = sdfFull.parse(endDateStr);
            } catch (ParseException e) {
                endDate = sdfDate.parse(endDateStr);
            }
        } catch (ParseException e) {
            throw new RuntimeException("Format date is not valid!", e);
        }

        Pageable pageable = PageRequest.of(page, size);
        Page<Transaction> transactionPage = transactionsJpaRepository.findAllByUserIdAndDateRange(userId, startDate,
                endDate, pageable);

        List<TransactionResponseDto> transactionDtos = transactionPage.getContent().stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());

        return PaginationTransactionResponseDto.builder()
                .transactions(transactionDtos)
                .pageNumber(transactionPage.getNumber())
                .pageSize(transactionPage.getSize())
                .totalRecords(transactionPage.getTotalElements())
                .totalPages(transactionPage.getTotalPages())
                .hasNext(transactionPage.hasNext())
                .hasPrevious(transactionPage.hasPrevious())
                .build();
    }

    public boolean existsByTransactionCode(String transactionCode) {
        return transactionsJpaRepository.existsByTransactionCode(transactionCode);
    }
}
