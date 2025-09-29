package com.ants.ktc.ants_ktc.controllers;

import com.ants.ktc.ants_ktc.dtos.contract.ContractRequestDto;
import com.ants.ktc.ants_ktc.dtos.contract.ContractResponseDto;
import com.ants.ktc.ants_ktc.dtos.contract.ContractUpdateRequestDto;
import com.ants.ktc.ants_ktc.services.BillExportService;
import com.ants.ktc.ants_ktc.services.ContractService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/contracts")
public class ContractController {

    @Autowired
    private ContractService contractService;

    @Autowired
    private BillExportService billExportService;

    @PostMapping
    public ResponseEntity<ContractResponseDto> createContract(@RequestBody @Valid ContractRequestDto dto) {
        return ResponseEntity.ok(contractService.createContract(dto));
    }

    @GetMapping("/tenant/{tenantId}")
    public ResponseEntity<List<ContractResponseDto>> getContractsByTenant(@PathVariable("tenantId") UUID tenantId) {
        return ResponseEntity.ok(contractService.getContractsByTenant(tenantId));
    }

    @GetMapping("/landlord/{landlordId}")
    public ResponseEntity<Page<ContractResponseDto>> getContractsByLandlord(
            @PathVariable("landlordId") UUID landlordId,
            Pageable pageable) {
        return ResponseEntity.ok(contractService.getContractsByLandlord(landlordId, pageable));
    }

    @GetMapping("/room/{roomId}")
    public ResponseEntity<List<ContractResponseDto>> getContractsByRoom(@PathVariable("roomId") UUID roomId) {
        return ResponseEntity.ok(contractService.getContractsByRoom(roomId));
    }

    @GetMapping("/{contractId}")
    public ResponseEntity<ContractResponseDto> getContractById(@PathVariable("contractId") UUID contractId) {
        return ResponseEntity.ok(contractService.getContractById(contractId));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ContractResponseDto> updateContract(
            @PathVariable("id") UUID id,
            @RequestBody @Valid ContractUpdateRequestDto dto) {
        dto.setId(id);
        return ResponseEntity.ok(contractService.updateContract(dto));
    }

    @PutMapping("/{id}/image")
    public ResponseEntity<ContractResponseDto> updateContractImage(
            @PathVariable("id") UUID id,
            @RequestParam("file") MultipartFile file) {
        return ResponseEntity.ok(contractService.uploadContractImage(id, file));
    }

    @GetMapping("/status/{status}")
    public ResponseEntity<List<ContractResponseDto>> getContractsByStatus(@PathVariable("status") int status) {
        return ResponseEntity.ok(contractService.getContractsByStatus(status));
    }

    @GetMapping("/{contractId}/bills/export")
    public ResponseEntity<byte[]> exportBills(
            @PathVariable UUID contractId,
            @RequestParam("fromMonth") String fromMonth,
            @RequestParam("toMonth") String toMonth) throws Exception {
        byte[] data = billExportService.exportBillsToExcel(contractId, fromMonth, toMonth);
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=bills.xlsx")
                .contentType(MediaType.APPLICATION_OCTET_STREAM)
                .body(data);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteContract(@PathVariable("id") UUID id) {
        contractService.deleteContract(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/test")
    public String runAutoTask() {
        contractService.autoTaskBillsGeneration();
        return "Task completed";
    }
}
