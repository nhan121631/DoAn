package com.ants.ktc.ants_ktc.services;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.ants.ktc.ants_ktc.dtos.bill.BillResponseDto;
import com.ants.ktc.ants_ktc.dtos.contract.ContractRequestDto;
import com.ants.ktc.ants_ktc.dtos.contract.ContractResponseDto;
import com.ants.ktc.ants_ktc.dtos.contract.ContractUpdateRequestDto;
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

        if(contract.getBills() != null) {
            dto.setBills(contract.getBills().stream()
                    .map(b -> new BillResponseDto(
                            b.getId(),
                            b.getMonth(),
                            b.getElectricityFee(),
                            b.getWaterFee(),
                            b.getServiceFee(),
                            b.getTotalAmount(),
                            b.isPaid()
                    )).collect(Collectors.toList()));
        }

        return dto;
    }
}
