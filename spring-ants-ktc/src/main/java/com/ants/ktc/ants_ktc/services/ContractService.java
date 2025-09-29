package com.ants.ktc.ants_ktc.services;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.ants.ktc.ants_ktc.dtos.LandlordTask.LandlordTaskCreateDto;
import com.ants.ktc.ants_ktc.dtos.bill.BillResponseDto;
import com.ants.ktc.ants_ktc.dtos.contract.ContractRequestDto;
import com.ants.ktc.ants_ktc.dtos.contract.ContractResponseDto;
import com.ants.ktc.ants_ktc.dtos.contract.ContractUpdateRequestDto;
import com.ants.ktc.ants_ktc.dtos.contract.PaymentInfoDto;
import com.ants.ktc.ants_ktc.entities.Contract;
import com.ants.ktc.ants_ktc.entities.Room;
import com.ants.ktc.ants_ktc.entities.User;
import com.ants.ktc.ants_ktc.repositories.ContractJpaRepository;
import com.ants.ktc.ants_ktc.repositories.RoomJpaRepository;
import com.ants.ktc.ants_ktc.repositories.UserJpaRepository;

@Service
@Transactional
public class ContractService {
    @Autowired
    private ContractJpaRepository contractJpaRepository;
    @Autowired
    private RoomJpaRepository roomJpaRepository;
    @Autowired
    private UserJpaRepository userJpaRepository;
    @Autowired
    private LandlordTaskService landlordTaskService;

    public ContractResponseDto createContract(ContractRequestDto request) {
        Room room = roomJpaRepository.findById(request.getRoomId())
                .orElseThrow(() -> new RuntimeException("Room not found"));
        User tenant = userJpaRepository.findById(request.getTenantId())
                .orElseThrow(() -> new RuntimeException("Tenant not found"));
        User landlord = userJpaRepository.findById(request.getLandlordId())
                .orElseThrow(() -> new RuntimeException("Landlord not found"));
        Contract contract = new Contract();
        contract.setContractName("Contract with " + tenant.getUsername() + " " + request.getStartDate());
        contract.setRoom(room);
        contract.setTenant(tenant);
        contract.setLandlord(landlord);
        contract.setStartDate(request.getStartDate());
        contract.setEndDate(request.getEndDate());
        contract.setDepositAmount(request.getDepositAmount());
        contract.setMonthlyRent(request.getMonthlyRent());
        contract.setStatus(request.getStatus());

        Contract saved = contractJpaRepository.save(contract);
        return toResponseDto(saved);
    }

    public ContractResponseDto updateContract(ContractUpdateRequestDto request) {
        Contract contract = contractJpaRepository.findById(request.getId())
                .orElseThrow(() -> new RuntimeException("Contract not found"));

        // Cập nhật room nếu có
        if (request.getRoomId() != null) {
            Room room = roomJpaRepository.findById(request.getRoomId())
                    .orElseThrow(() -> new RuntimeException("Room not found"));
            contract.setRoom(room);
        }

        // Cập nhật tenant nếu có
        if (request.getTenantId() != null) {
            User tenant = userJpaRepository.findById(request.getTenantId())
                    .orElseThrow(() -> new RuntimeException("Tenant not found"));
            contract.setTenant(tenant);
        }

        // Cập nhật landlord nếu có
        if (request.getLandlordId() != null) {
            User landlord = userJpaRepository.findById(request.getLandlordId())
                    .orElseThrow(() -> new RuntimeException("Landlord not found"));
            contract.setLandlord(landlord);
        }

        if (request.getStartDate() != null) {
            contract.setStartDate(request.getStartDate());
        }

        if (request.getEndDate() != null) {
            contract.setEndDate(request.getEndDate());
        }

        if (request.getDepositAmount() != null) {
            contract.setDepositAmount(request.getDepositAmount());
        }

        if (request.getMonthlyRent() != null) {
            contract.setMonthlyRent(request.getMonthlyRent());
        }

        if (request.getStatus() != null) {
            contract.setStatus(request.getStatus());
        }

        Contract saved = contractJpaRepository.save(contract);

        return toResponseDto(saved);
    }

    public List<ContractResponseDto> getContractsByTenant(UUID tenantId) {
        List<Contract> contracts = contractJpaRepository.findByTenantIdWithDetails(tenantId);
        return contracts.stream().map(this::toResponseDto).collect(Collectors.toList());
    }

    public Page<ContractResponseDto> getContractsByLandlord(UUID landlordId, Pageable pageable) {
        return contractJpaRepository.findByLandlordId(landlordId, pageable)
                .map(this::toResponseDto);
    }

    public List<ContractResponseDto> getContractsByRoom(UUID roomId) {
        return contractJpaRepository.findByRoomId(roomId)
                .stream().map(this::toResponseDto).collect(Collectors.toList());
    }

    public ContractResponseDto getContractById(UUID contractId) {
        Contract contract = contractJpaRepository.findByIdWithDetails(contractId);
        return toResponseDto(contract);
    }

    public List<ContractResponseDto> getContractsByStatus(int status) {
        return contractJpaRepository.findByStatus(status)
                .stream().map(this::toResponseDto).collect(Collectors.toList());
    }

    public void deleteContract(UUID contractId) {
        Contract contract = contractJpaRepository.findById(contractId)
                .orElseThrow(() -> new IllegalArgumentException("Contract not found with id: " + contractId));

        if (contract.getStatus() == 1) { // Assuming 1 is ACTIVE status
            throw new RuntimeException("Cannot delete active contract");
        }

        contractJpaRepository.delete(contract);
    }

    private ContractResponseDto toResponseDto(Contract contract) {
        ContractResponseDto dto = new ContractResponseDto();
        dto.setContractName(contract.getContractName());
        dto.setId(contract.getId());
        dto.setRoomId(contract.getRoom().getId());
        dto.setRoomTitle(contract.getRoom().getTitle());
        dto.setTenantId(contract.getTenant().getId());
        dto.setTenantName(contract.getTenant().getUsername());
        dto.setTenantPhone(contract.getTenant().getProfile().getPhoneNumber());
        dto.setLandlordId(contract.getLandlord().getId());
        dto.setLandlordName(contract.getLandlord().getUsername());
        dto.setStartDate(contract.getStartDate());
        dto.setEndDate(contract.getEndDate());
        dto.setDepositAmount(contract.getDepositAmount());
        dto.setMonthlyRent(contract.getMonthlyRent());
        dto.setStatus(contract.getStatus());

        if (contract.getBills() != null) {
            Room room = contract.getRoom();

            dto.setBills(contract.getBills().stream()
                    .map(b -> {
                        Double elecPrice = room.getElecPrice();
                        Double waterPrice = room.getWaterPrice();

                        Double electricityUsage = (elecPrice != null && elecPrice > 0)
                                ? b.getElectricityFee() / elecPrice
                                : null;
                        Double waterUsage = (waterPrice != null && waterPrice > 0)
                                ? b.getWaterFee() / waterPrice
                                : null;
                        double damageFee = b.getTotalAmount()
                                - (b.getElectricityFee() + b.getWaterFee() + b.getServiceFee());

                        return BillResponseDto.builder()
                                .id(b.getId())
                                .month(b.getMonth())
                                .electricityPrice(elecPrice)
                                .electricityUsage(electricityUsage)
                                .electricityFee(b.getElectricityFee())
                                .waterPrice(waterPrice)
                                .waterUsage(waterUsage)
                                .waterFee(b.getWaterFee())
                                .damageFee(damageFee)
                                .serviceFee(b.getServiceFee())
                                .totalAmount(b.getTotalAmount())
                                .status(b.getStatus())
                                .imageProof(b.getImageProof())
                                .build();
                    })
                    .collect(Collectors.toList()));
        }

        if (contract.getLandlord() != null && contract.getLandlord().getProfile() != null) {
            var profile = contract.getLandlord().getProfile();
            dto.setLandlordPaymentInfo(new PaymentInfoDto(
                    profile.getBankName(),
                    profile.getBankNumber(),
                    profile.getBinCode(),
                    profile.getAccoutHolderName(),
                    profile.getPhoneNumber()));
        }

        return dto;
    }

    @Scheduled(cron = "0 0 1 * * *") // Chạy vào 1h sáng mỗi ngày
    public void autoTaskBillsGeneration() {
        System.out.println("[Auto Task] Start generating tasks for contracts...");
        List<Contract> activeContracts = contractJpaRepository.findByStatus(0); // 0 is ACTIVE
        for (Contract contract : activeContracts) {
            LocalDate startDate = contract.getStartDate().toInstant()
                    .atZone(java.time.ZoneId.systemDefault())
                    .toLocalDate();
            long days = java.time.temporal.ChronoUnit.DAYS.between(startDate, LocalDate.now());
            System.out.println("[Auto Task] Contract ID: " + contract.getId() + ", Days: " + days);
            if (days > 0 && days % 30 == 0) {
                LandlordTaskCreateDto dto = LandlordTaskCreateDto.builder()
                        .title("Tính tiền trọ tháng " + LocalDate.now().getMonthValue() + "/"
                                + LocalDate.now().getYear() + " cho phòng " + contract.getRoom().getTitle())
                        .description("Calculate the monthly rent for room " + contract.getRoom().getTitle())
                        .startDate(LocalDateTime.now())
                        .dueDate(LocalDateTime.now().plusDays(7)) // Set due date 7 days later
                        .status("PENDING")
                        .priority("MEDIUM")
                        .landlordId(contract.getLandlord().getId().toString())
                        .roomId(contract.getRoom().getId().toString())
                        .build();
                landlordTaskService.createTask(dto);
            }
        }
    }

}
