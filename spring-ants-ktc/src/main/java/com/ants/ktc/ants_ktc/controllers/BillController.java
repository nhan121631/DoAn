package com.ants.ktc.ants_ktc.controllers;

import java.util.List;
import java.util.UUID;

import com.ants.ktc.ants_ktc.enums.BillStatus;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import com.ants.ktc.ants_ktc.dtos.bill.BillRequestDto;
import com.ants.ktc.ants_ktc.dtos.bill.BillResponseDto;
import com.ants.ktc.ants_ktc.dtos.bill.BillUpdateDto;
import com.ants.ktc.ants_ktc.services.BillPdfService;
import com.ants.ktc.ants_ktc.services.BillService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/bills")
public class BillController {
    @Autowired
    private BillService billService;
    @Autowired
    private BillPdfService billPdfService;

    @PostMapping
    public ResponseEntity<BillResponseDto> createBill(@RequestBody @Valid BillRequestDto dto) {
        return ResponseEntity.ok(billService.createBill(dto));
    }

    @GetMapping("/contract/{contractId}")
    public ResponseEntity<List<BillResponseDto>> getBillsByContract(@PathVariable("contractId") UUID contractId) {
        return ResponseEntity.ok(billService.getBillsByContract(contractId));
    }

    @GetMapping("/tenant/{tenantId}")
    public ResponseEntity<List<BillResponseDto>> getBillsByTenant(@PathVariable("tenantId") UUID tenantId) {
        return ResponseEntity.ok(billService.getBillsByTenant(tenantId));
    }

    @PutMapping("/{billId}/status")
    public ResponseEntity<BillResponseDto> updateBillStatus(
            @PathVariable("billId") UUID billId,
            @RequestParam("status") BillStatus status // truyền ?status=CONFIRMING hoặc ?status=PAID
    ) {
        return ResponseEntity.ok(billService.updateBillStatus(billId, status));
    }

    @PutMapping("/{id}")
    public ResponseEntity<BillResponseDto> updateBill(
            @PathVariable("id") UUID id,
            @Valid @RequestBody BillUpdateDto dto) {
        dto.setId(id);
        return ResponseEntity.ok(billService.updateBill(dto));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteBill(@PathVariable("id") UUID id) {
        billService.deleteBill(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{billId}/download")
    public ResponseEntity<byte[]> downloadBillPdf(@PathVariable("billId") UUID billId) throws Exception {
        byte[] pdf = billPdfService.exportBillPdf(billId);

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=bill-" + billId + ".pdf")
                .contentType(MediaType.APPLICATION_PDF)
                .body(pdf);
    }

    @PostMapping("/{billId}/upload-image-proof")
    public ResponseEntity<String> uploadBillImageProof(
            @PathVariable("billId") UUID billId,
            @RequestPart("file") MultipartFile file) {
        try {
            String imageUrl = billService.uploadBillImageProof(billId, file);
            return ResponseEntity.ok(imageUrl);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Upload failed: " + e.getMessage());
        }
    }
}
