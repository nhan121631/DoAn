package com.ants.ktc.ants_ktc.services;

import com.ants.ktc.ants_ktc.dtos.bill.BillRequestDto;
import com.ants.ktc.ants_ktc.dtos.bill.BillResponseDto;
import com.ants.ktc.ants_ktc.dtos.bill.BillUpdateDto;
import com.ants.ktc.ants_ktc.entities.Bill;
import com.ants.ktc.ants_ktc.entities.Contract;
import com.ants.ktc.ants_ktc.repositories.BillJpaRepository;
import com.ants.ktc.ants_ktc.repositories.ContractJpaRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@Transactional
public class BillService {
    @Autowired
    private BillJpaRepository billJpaRepository;
    @Autowired
    private ContractJpaRepository contractJpaRepository;

    public BillResponseDto createBill(BillRequestDto request) {
        Contract contract = contractJpaRepository.findById(request.getContractId())
                .orElseThrow(() -> new IllegalArgumentException("Contract not found"));


        Bill bill = new Bill();
        bill.setContract(contract);
        bill.setMonth(request.getMonth());
        bill.setElectricityFee(request.getElectricityFee());
        bill.setWaterFee(request.getWaterFee());
        bill.setServiceFee(request.getServiceFee());
        bill.setTotalAmount(request.getTotalAmount());
        bill.setPaid(request.isPaid());

        Bill saved = billJpaRepository.save(bill);
        return toResponseDto(saved);
    }
    public BillResponseDto updateBill(BillUpdateDto dto) {
        Bill bill = billJpaRepository.findById(dto.getId())
                .orElseThrow(() -> new IllegalArgumentException("Bill not found"));

        if (dto.getMonth() != null) bill.setMonth(dto.getMonth());
        if (dto.getElectricityFee() != null) bill.setElectricityFee(dto.getElectricityFee());
        if (dto.getWaterFee() != null) bill.setWaterFee(dto.getWaterFee());
        if (dto.getServiceFee() != null) bill.setServiceFee(dto.getServiceFee());
        if (dto.getTotalAmount() != null) bill.setTotalAmount(dto.getTotalAmount());
        if (dto.getPaid() != null) bill.setPaid(dto.getPaid());

        Bill saved = billJpaRepository.save(bill);
        return toResponseDto(saved);
    }

    public List<BillResponseDto> getBillsByContract(UUID contractId) {
        List<Bill> bills = billJpaRepository.findByContractId(contractId);
        return bills.stream().map(this::toResponseDto).collect(Collectors.toList());
    }
    public List<BillResponseDto> getBillsByTenant(UUID tenantId) {
        List<Bill> bills = billJpaRepository.findByTenantId(tenantId);
        return bills.stream().map(this::toResponseDto).collect(Collectors.toList());
    }

    public BillResponseDto updateBillPaid(UUID billId, boolean paid) {
        Bill bill = billJpaRepository.findById(billId)
                .orElseThrow(() -> new IllegalArgumentException("Bill not found"));
        bill.setPaid(paid);
        Bill updated = billJpaRepository.save(bill);
        return toResponseDto(updated);
    }
    public void deleteBill(UUID billId) {
        Bill bill = billJpaRepository.findById(billId)
                .orElseThrow(() -> new IllegalArgumentException("Bill not found"));
        billJpaRepository.delete(bill);
    }


    private BillResponseDto toResponseDto(Bill bill) {
        BillResponseDto dto = new BillResponseDto();
        dto.setId(bill.getId());
        dto.setMonth(bill.getMonth());
        dto.setElectricityFee(bill.getElectricityFee());
        dto.setWaterFee(bill.getWaterFee());
        dto.setServiceFee(bill.getServiceFee());
        dto.setTotalAmount(bill.getTotalAmount());
        dto.setPaid(bill.isPaid());
        return dto;
    }

}
