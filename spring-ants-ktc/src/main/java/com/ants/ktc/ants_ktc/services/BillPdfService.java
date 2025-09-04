package com.ants.ktc.ants_ktc.services;

import com.ants.ktc.ants_ktc.entities.Bill;
import com.ants.ktc.ants_ktc.entities.Contract;
import com.ants.ktc.ants_ktc.repositories.BillJpaRepository;
import com.itextpdf.kernel.colors.DeviceRgb;
import com.itextpdf.kernel.pdf.PdfDocument;
import com.itextpdf.kernel.pdf.PdfWriter;
import com.itextpdf.layout.Document;
import com.itextpdf.layout.element.*;
import com.itextpdf.layout.properties.TextAlignment;
import com.itextpdf.layout.properties.UnitValue;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.time.LocalDate;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class BillPdfService {
    private final BillJpaRepository billJpaRepository;

    public byte[] exportBillPdf(UUID billId) throws Exception {
        Bill bill = billJpaRepository.findById(billId)
                .orElseThrow(() -> new IllegalArgumentException("Bill not found"));

        ByteArrayOutputStream bos = new ByteArrayOutputStream();
        PdfWriter writer = new PdfWriter(bos);
        PdfDocument pdf = new PdfDocument(writer);
        Document doc = new Document(pdf);

        // ---------- HEADER ----------
        Paragraph header = new Paragraph("RENTAL INVOICE")
                .setBold()
                .setFontSize(18)
                .setTextAlignment(TextAlignment.CENTER);

        Paragraph subHeader = new Paragraph("Payment for Room Rental")
                .setFontSize(12)
                .setFontColor(new DeviceRgb(100, 100, 100))
                .setTextAlignment(TextAlignment.CENTER);

        doc.add(header);
        doc.add(subHeader);
        doc.add(new Paragraph("Issued Date: " + LocalDate.now())
                .setTextAlignment(TextAlignment.CENTER)
                .setFontSize(10));
        doc.add(new Paragraph("Invoice ID: #" + bill.getId())
                .setTextAlignment(TextAlignment.CENTER)
                .setFontSize(10));

        doc.add(new Paragraph("\n"));

        // ---------- CUSTOMER INFO ----------
        doc.add(new Paragraph("CUSTOMER INFORMATION")
                .setBold()
                .setFontSize(14)
                .setFontColor(new DeviceRgb(50, 50, 50)));

        Table customerTable = new Table(UnitValue.createPercentArray(new float[]{1, 2}))
                .useAllAvailableWidth();

        // Lấy dữ liệu từ bill -> tenant -> room

        Contract contract = bill.getContract();
        String tenantName = (contract.getTenant() != null && contract.getTenant().getUsername() != null)
                ? contract.getTenant().getUsername() : "N/A";
        String tenantPhone = (contract.getTenant() != null
                && contract.getTenant().getProfile() != null
                && contract.getTenant().getProfile().getPhoneNumber() != null)
                ? contract.getTenant().getProfile().getPhoneNumber() : "N/A";

        String roomName = (contract.getRoom() != null && contract.getRoom().getName() != null)
                ? contract.getRoom().getName() : "N/A";

        customerTable.addCell(makeCell("Full Name:", true));
        customerTable.addCell(makeCell(tenantName, false));

        customerTable.addCell(makeCell("Phone Number:", true));
        customerTable.addCell(makeCell(tenantPhone, false));

        customerTable.addCell(makeCell("Room:", true));
        customerTable.addCell(makeCell(roomName, false));

        customerTable.addCell(makeCell("Month:", true));
        customerTable.addCell(makeCell(bill.getMonth(), false));

        doc.add(customerTable);
        doc.add(new Paragraph("\n"));

        // ---------- BILL DETAILS ----------
        doc.add(new Paragraph("BILL DETAILS")
                .setBold()
                .setFontSize(14)
                .setFontColor(new DeviceRgb(50, 50, 50)));

        Table billTable = new Table(UnitValue.createPercentArray(new float[]{3, 2}))
                .useAllAvailableWidth();

        // header row
        billTable.addHeaderCell(makeHeaderCell("Item"));
        billTable.addHeaderCell(makeHeaderCell("Amount"));

        // data rows
        billTable.addCell(makeCell("Electricity", false));
        billTable.addCell(makeCell(formatMoney(bill.getElectricityFee()), false, TextAlignment.RIGHT));

        billTable.addCell(makeCell("Water", false));
        billTable.addCell(makeCell(formatMoney(bill.getWaterFee()), false, TextAlignment.RIGHT));

        billTable.addCell(makeCell("Service Fee", false));
        billTable.addCell(makeCell(formatMoney(bill.getServiceFee()), false, TextAlignment.RIGHT));

        // total row
        billTable.addCell(makeCell("TOTAL", true));
        billTable.addCell(makeCell(formatMoney(bill.getTotalAmount()), true, TextAlignment.RIGHT));

        doc.add(billTable);
        doc.add(new Paragraph("\n"));

        // ---------- FOOTER ----------
        Paragraph footer = new Paragraph("Thank you for choosing our service!")
                .setFontSize(10)
                .setTextAlignment(TextAlignment.CENTER)
                .setFontColor(new DeviceRgb(120, 120, 120));
        doc.add(footer);

        doc.close();
        return bos.toByteArray();
    }

    // Helper method: format money
    private String formatMoney(double amount) {
        return String.format("%,.0f VND", amount);
    }

    // Helper method: styled cell
    private Cell makeCell(String text, boolean bold) {
        return makeCell(text, bold, TextAlignment.LEFT);
    }

    private Cell makeCell(String text, boolean bold, TextAlignment align) {
        Paragraph p = new Paragraph(text).setFontSize(11).setTextAlignment(align);
        if (bold) p.setBold();
        return new Cell().add(p);
    }

    private Cell makeHeaderCell(String text) {
        return new Cell().add(new Paragraph(text).setBold().setFontSize(12))
                .setBackgroundColor(new DeviceRgb(230, 230, 230))
                .setTextAlignment(TextAlignment.CENTER);
    }
}
