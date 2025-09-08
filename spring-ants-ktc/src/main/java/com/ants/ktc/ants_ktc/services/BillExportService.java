package com.ants.ktc.ants_ktc.services;

import com.ants.ktc.ants_ktc.entities.Bill;
import com.ants.ktc.ants_ktc.entities.Room;
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
        // Chuyển từ String sang YearMonth
        YearMonth from = YearMonth.parse(fromMonth); // Ví dụ: "2024-01"
        YearMonth to = YearMonth.parse(toMonth);

        // Lọc bills theo khoảng tháng
        List<Bill> bills = billJpaRepository.findByContractId(contractId)
                .stream()
                .filter(b -> {
                    YearMonth ym = YearMonth.parse(b.getMonth());
                    return (ym.equals(from) || ym.isAfter(from)) &&
                            (ym.equals(to)   || ym.isBefore(to));
                })
                .toList();

        Workbook workbook = new XSSFWorkbook();
        Sheet sheet = workbook.createSheet("Bills");
        int rowIdx = 0;

        // Header row
        Row header = sheet.createRow(rowIdx++);
        String[] headers = {
                "Month",
                "Elec Price", "Elec Usage", "Elec Fee",
                "Water Price", "Water Usage", "Water Fee",
                "Service Fee", "Damage Fee",
                "Total", "Status"
        };

        for (int i = 0; i < headers.length; i++) {
            Cell cell = header.createCell(i);
            cell.setCellValue(headers[i]);
        }

        // Data rows
        for (Bill b : bills) {
            Room room = b.getContract().getRoom();
            Double elecPrice = room.getElecPrice();
            Double waterPrice = room.getWaterPrice();

            Double elecUsage = (elecPrice != null && elecPrice > 0)
                    ? safeDivide(b.getElectricityFee(), elecPrice)
                    : null;
            Double waterUsage = (waterPrice != null && waterPrice > 0)
                    ? safeDivide(b.getWaterFee(), waterPrice)
                    : null;

            // Tính damageFee = totalAmount - (electricity + water + service)
            Double damageFee = null;
            if (b.getTotalAmount() != null) {
                double elec = b.getElectricityFee() != null ? b.getElectricityFee() : 0.0;
                double water = b.getWaterFee() != null ? b.getWaterFee() : 0.0;
                double service = b.getServiceFee() != null ? b.getServiceFee() : 0.0;
                damageFee = b.getTotalAmount() - (elec + water + service);
            }

            Row row = sheet.createRow(rowIdx++);
            int col = 0;

            row.createCell(col++).setCellValue(b.getMonth());

            row.createCell(col++).setCellValue(elecPrice != null ? elecPrice : 0);
            row.createCell(col++).setCellValue(elecUsage != null ? elecUsage : 0);
            row.createCell(col++).setCellValue(b.getElectricityFee() != null ? b.getElectricityFee() : 0);

            row.createCell(col++).setCellValue(waterPrice != null ? waterPrice : 0);
            row.createCell(col++).setCellValue(waterUsage != null ? waterUsage : 0);
            row.createCell(col++).setCellValue(b.getWaterFee() != null ? b.getWaterFee() : 0);

            row.createCell(col++).setCellValue(b.getServiceFee() != null ? b.getServiceFee() : 0);
            row.createCell(col++).setCellValue(damageFee != null ? damageFee : 0);

            row.createCell(col++).setCellValue(b.getTotalAmount() != null ? b.getTotalAmount() : 0);
            row.createCell(col++).setCellValue(b.getStatus() != null ? b.getStatus().name() : "");
        }

        // Auto size columns
        for (int i = 0; i < headers.length; i++) {
            sheet.autoSizeColumn(i);
        }

        // Ghi ra byte[]
        ByteArrayOutputStream bos = new ByteArrayOutputStream();
        workbook.write(bos);
        workbook.close();

        return bos.toByteArray();
    }

    private Double safeDivide(Double numerator, Double denominator) {
        if (numerator == null || denominator == null || denominator == 0) return null;
        return numerator / denominator;
    }
}