package com.ants.ktc.ants_ktc.services;


import com.ants.ktc.ants_ktc.entities.Bill;
import com.ants.ktc.ants_ktc.repositories.BillJpaRepository;
import lombok.RequiredArgsConstructor;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.time.YearMonth;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class BillExportService {
    private final BillJpaRepository billJpaRepository;

    public byte[] exportBillsToExcel(UUID contractId, String fromMonth, String toMonth) throws Exception {
        // Convert từ String sang YearMonth
        YearMonth from = YearMonth.parse(fromMonth); // vd: "2024-01"
        YearMonth to = YearMonth.parse(toMonth);

        List<Bill> bills = billJpaRepository.findByContractId(contractId)
                .stream()
                .filter(b -> {
                    YearMonth ym = YearMonth.parse(b.getMonth());
                    return (ym.equals(from) || ym.isAfter(from)) &&
                            (ym.equals(to) || ym.isBefore(to));
                })
                .toList();

        Workbook workbook = new XSSFWorkbook();
        Sheet sheet = workbook.createSheet("Bills");
        int rowIdx = 0;

        // Header
        Row header = sheet.createRow(rowIdx++);
        String[] headers = {"Month", "Electricity", "Water", "Service", "Total", "Paid"};
        for (int i = 0; i < headers.length; i++) {
            Cell cell = header.createCell(i);
            cell.setCellValue(headers[i]);
        }

        // Data
        for (Bill b : bills) {
            Row row = sheet.createRow(rowIdx++);
            row.createCell(0).setCellValue(b.getMonth());
            row.createCell(1).setCellValue(b.getElectricityFee());
            row.createCell(2).setCellValue(b.getWaterFee());
            row.createCell(3).setCellValue(b.getServiceFee());
            row.createCell(4).setCellValue(b.getTotalAmount());
            row.createCell(5).setCellValue(b.isPaid() ? "PAID" : "UNPAID");
        }

        // Ghi ra byte[]
        ByteArrayOutputStream bos = new ByteArrayOutputStream();
        workbook.write(bos);
        workbook.close();
        return bos.toByteArray();
    }
}