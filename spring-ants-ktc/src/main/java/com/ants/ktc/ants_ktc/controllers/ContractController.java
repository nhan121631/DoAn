package com.ants.ktc.ants_ktc.controllers;

import java.util.List;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.ants.ktc.ants_ktc.dtos.contract.ContractRequestDto;
import com.ants.ktc.ants_ktc.dtos.contract.ContractResponseDto;
import com.ants.ktc.ants_ktc.services.BillExportService;
import com.ants.ktc.ants_ktc.services.ContractService;

import jakarta.validation.Valid;

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

    @GetMapping("/status/{status}")
    public ResponseEntity<List<ContractResponseDto>> getContractsByStatus(@PathVariable("status") int status) {
        return ResponseEntity.ok(contractService.getContractsByStatus(status));
    }

    @GetMapping("/{contractId}/bills/export")
    public ResponseEntity<byte[]> exportBills(
            @PathVariable("contractId") UUID contractId,
            @RequestParam(value = "fromMonth") String fromMonth, // yyyy-MM
            @RequestParam(value = "toMonth") String toMonth) throws Exception {
        byte[] data = billExportService.exportBillsToExcel(contractId, fromMonth, toMonth);

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=bills.xlsx")
                .contentType(MediaType.APPLICATION_OCTET_STREAM)
                .body(data);
    }

}
