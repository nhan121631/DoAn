package com.ants.ktc.ants_ktc.services;

import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import com.ants.ktc.ants_ktc.dtos.bill.BillRequestDto;
import com.ants.ktc.ants_ktc.dtos.bill.BillResponseDto;
import com.ants.ktc.ants_ktc.dtos.bill.BillUpdateDto;
import com.ants.ktc.ants_ktc.entities.Bill;
import com.ants.ktc.ants_ktc.entities.Contract;
import com.ants.ktc.ants_ktc.entities.Room;
import com.ants.ktc.ants_ktc.enums.BillStatus;
import com.ants.ktc.ants_ktc.repositories.BillJpaRepository;
import com.ants.ktc.ants_ktc.repositories.ContractJpaRepository;

import jakarta.transaction.Transactional;

@Service
@Transactional
public class BillService {
    @Autowired
    private BillJpaRepository billJpaRepository;
    @Autowired
    private ContractJpaRepository contractJpaRepository;
    @Autowired
    private CloudinaryService cloudinaryService;

    public BillResponseDto createBill(BillRequestDto request) {
        Contract contract = contractJpaRepository.findById(request.getContractId())
                .orElseThrow(() -> new IllegalArgumentException("Contract not found"));

        Bill bill = new Bill();
        bill.setContract(contract);
        bill.setMonth(request.getMonth());
        bill.setElectricityFee(request.getElectricityFee());
        bill.setWaterFee(request.getWaterFee());
        bill.setServiceFee(request.getServiceFee());
        bill.setNote(request.getNote());
        bill.setTotalAmount(request.getTotalAmount());
        bill.setStatus(BillStatus.PENDING);

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
        if (dto.getNote() != null) bill.setNote(dto.getNote());
        if (dto.getTotalAmount() != null) bill.setTotalAmount(dto.getTotalAmount());
        if (dto.getStatus() != null) bill.setStatus(dto.getStatus());

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

    public BillResponseDto updateBillStatus(UUID billId, BillStatus status) {
        Bill bill = billJpaRepository.findById(billId)
                .orElseThrow(() -> new IllegalArgumentException("Bill not found"));
        bill.setStatus(status);
        Bill updated = billJpaRepository.save(bill);
        return toResponseDto(updated);
    }

    public void deleteBill(UUID billId) {
        Bill bill = billJpaRepository.findById(billId)
                .orElseThrow(() -> new IllegalArgumentException("Bill not found"));
        billJpaRepository.delete(bill);
    }

    // upload anh chung minh thanh toan hoa don
    @Transactional
    public String uploadBillImageProof(UUID billId, MultipartFile file) {
        try {
            // Verify bill exists
            Bill bill = billJpaRepository.findById(billId)
                    .orElseThrow(() -> new IllegalArgumentException("Bill not found"));

            // Upload image to Cloudinary
            Map<String, String> uploadResult = cloudinaryService.uploadFile(file);
            String imageUrl = uploadResult.get("url");

            // Update bill with image proof URL
            bill.setImageProof(imageUrl);
            billJpaRepository.save(bill);

            return imageUrl;
        } catch (Exception e) {
            throw new RuntimeException("Failed to upload bill image proof: " + e.getMessage());
        }
    }

    private BillResponseDto toResponseDto(Bill bill) {
        Room room = bill.getContract().getRoom();
        Double elecPrice = room.getElecPrice();
        Double waterPrice = room.getWaterPrice();

        // Tính usage dựa trên fee / price (nếu giá != 0)
        Double electricityUsage = (elecPrice != null && elecPrice > 0)
                ? bill.getElectricityFee() / elecPrice
                : null;
        Double waterUsage = (waterPrice != null && waterPrice > 0)
                ? bill.getWaterFee() / waterPrice
                : null;

        // Tính damageFee (không lưu DB, chỉ trả về response)
        Double damageFee = null;
        if (bill.getTotalAmount() != null) {
            double totalBase = (bill.getElectricityFee() != null ? bill.getElectricityFee() : 0)
                    + (bill.getWaterFee() != null ? bill.getWaterFee() : 0)
                    + (bill.getServiceFee() != null ? bill.getServiceFee() : 0);
            damageFee = bill.getTotalAmount() - totalBase;
        }
        String note = bill.getNote();

        return BillResponseDto.builder()
                .id(bill.getId())
                .month(bill.getMonth())
                .electricityPrice(elecPrice)
                .electricityUsage(electricityUsage)
                .electricityFee(bill.getElectricityFee())
                .waterPrice(waterPrice)
                .waterUsage(waterUsage)
                .waterFee(bill.getWaterFee())
                .serviceFee(bill.getServiceFee())
                .note(note)
                .damageFee(damageFee)
                .totalAmount(bill.getTotalAmount())
                .status(bill.getStatus())
                .imageProof(bill.getImageProof())
                .build();
    }

}
