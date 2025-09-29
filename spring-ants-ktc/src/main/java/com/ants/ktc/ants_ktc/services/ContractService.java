package com.ants.ktc.ants_ktc.services;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

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

    @Autowired
    private CloudinaryService cloudinaryService;

    /**
     * 📌 Tạo hợp đồng mới
     */
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

    /**
     * ✏️ Cập nhật thông tin hợp đồng
     */
    public ContractResponseDto updateContract(ContractUpdateRequestDto request) {
        Contract contract = contractJpaRepository.findById(request.getId())
                .orElseThrow(() -> new RuntimeException("Contract not found"));

        if (request.getRoomId() != null) {
            Room room = roomJpaRepository.findById(request.getRoomId())
                    .orElseThrow(() -> new RuntimeException("Room not found"));
            contract.setRoom(room);
        }

        if (request.getTenantId() != null) {
            User tenant = userJpaRepository.findById(request.getTenantId())
                    .orElseThrow(() -> new RuntimeException("Tenant not found"));
            contract.setTenant(tenant);
        }

        if (request.getLandlordId() != null) {
            User landlord = userJpaRepository.findById(request.getLandlordId())
                    .orElseThrow(() -> new RuntimeException("Landlord not found"));
            contract.setLandlord(landlord);
        }

        if (request.getStartDate() != null)
            contract.setStartDate(request.getStartDate());
        if (request.getEndDate() != null)
            contract.setEndDate(request.getEndDate());
        if (request.getDepositAmount() != null)
            contract.setDepositAmount(request.getDepositAmount());
        if (request.getMonthlyRent() != null)
            contract.setMonthlyRent(request.getMonthlyRent());
        if (request.getStatus() != null)
            contract.setStatus(request.getStatus());
        if (request.getContractImage() != null)
            contract.setContractImage(request.getContractImage());

        Contract saved = contractJpaRepository.save(contract);
        return toResponseDto(saved);
    }

    public List<ContractResponseDto> getContractsByTenant(UUID tenantId) {
        return contractJpaRepository.findByTenantIdWithDetails(tenantId)
                .stream()
                .map(this::toResponseDto)
                .collect(Collectors.toList());
    }

    public Page<ContractResponseDto> getContractsByLandlord(UUID landlordId, Pageable pageable) {
        return contractJpaRepository.findByLandlordId(landlordId, pageable)
                .map(this::toResponseDto);
    }

    public List<ContractResponseDto> getContractsByRoom(UUID roomId) {
        return contractJpaRepository.findByRoomId(roomId)
                .stream()
                .map(this::toResponseDto)
                .collect(Collectors.toList());
    }

    public ContractResponseDto getContractById(UUID contractId) {
        Contract contract = contractJpaRepository.findByIdWithDetails(contractId);
        return toResponseDto(contract);
    }

    public List<ContractResponseDto> getContractsByStatus(int status) {
        return contractJpaRepository.findByStatus(status)
                .stream()
                .map(this::toResponseDto)
                .collect(Collectors.toList());
    }

    public void deleteContract(UUID contractId) {
        Contract contract = contractJpaRepository.findById(contractId)
                .orElseThrow(() -> new IllegalArgumentException("Contract not found with id: " + contractId));

        if (contract.getStatus() == 1) { // 1 = ACTIVE
            throw new RuntimeException("Cannot delete active contract");
        }

        contractJpaRepository.delete(contract);
    }

    @Transactional
    public ContractResponseDto uploadContractImage(UUID contractId, MultipartFile file) {
        Contract contract = contractJpaRepository.findById(contractId)
                .orElseThrow(() -> new RuntimeException("Contract not found"));

        // Xóa ảnh cũ nếu có
        if (contract.getContractImage() != null) {
            String oldPublicId = extractPublicId(contract.getContractImage());
            if (oldPublicId != null) {
                cloudinaryService.deleteFile(oldPublicId);
            }
        }

        // Upload ảnh mới lên Cloudinary
        Map<String, String> uploadResult = cloudinaryService.uploadFile(file);
        contract.setContractImage(uploadResult.get("url"));

        Contract saved = contractJpaRepository.save(contract);
        return toResponseDto(saved);
    }

    private String extractPublicId(String contractImageUrl) {
        if (contractImageUrl == null)
            return null;
        int lastSlash = contractImageUrl.lastIndexOf("/");
        int dotIndex = contractImageUrl.lastIndexOf(".");
        if (lastSlash != -1 && dotIndex != -1 && dotIndex > lastSlash) {
            return contractImageUrl.substring(lastSlash + 1, dotIndex);
        }
        return null;
    }

    @Scheduled(cron = "0 0 1 * * *") // 1h sáng mỗi ngày
    public void autoTaskBillsGeneration() {
        System.out.println("[Auto Task] Start generating tasks for contracts...");
        List<Contract> activeContracts = contractJpaRepository.findByStatus(0); // 0 = ACTIVE

        for (Contract contract : activeContracts) {
            LocalDate startDate = contract.getStartDate().toInstant()
                    .atZone(java.time.ZoneId.systemDefault())
                    .toLocalDate();
            long days = java.time.temporal.ChronoUnit.DAYS.between(startDate, LocalDate.now());

            if (days > 0 && days % 30 == 0) {
                LandlordTaskCreateDto dto = LandlordTaskCreateDto.builder()
                        .title("Bills month " + LocalDate.now().getMonthValue() + "/"
                                + LocalDate.now().getYear() + " for room " + contract.getRoom().getTitle())
                        .description("Calculate the monthly rent for room " + contract.getRoom().getTitle())
                        .startDate(LocalDateTime.now())
                        .dueDate(LocalDateTime.now().plusDays(7))
                        .type("BILL")
                        .status("PENDING")
                        .priority("MEDIUM")
                        .landlordId(contract.getLandlord().getId().toString())
                        .roomId(contract.getRoom().getId().toString())
                        .build();

                landlordTaskService.createTask(dto);
            }
        }
    }

    /**
     * 🧠 Convert entity → DTO
     */
    private ContractResponseDto toResponseDto(Contract contract) {
        ContractResponseDto dto = new ContractResponseDto();
        dto.setId(contract.getId());
        dto.setContractName(contract.getContractName());
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
        dto.setContractImage(contract.getContractImage()); // ✅ thêm trường ảnh

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
}
