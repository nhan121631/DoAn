package com.ants.ktc.ants_ktc.entities;

import com.ants.ktc.ants_ktc.enums.BillStatus;
import jakarta.persistence.*;
import lombok.Data;
import lombok.EqualsAndHashCode;

@Entity
@Table(name = "bills")
@Data
@EqualsAndHashCode(callSuper = true)
public class Bill extends BaseEntity {
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "contract_id", nullable = false)
    private Contract contract;

    @Column(name = "month", nullable = false)
    private String month; // Ví dụ "2025-08"

    @Column(name = "electricity_fee")
    private Double electricityFee;

    @Column(name = "water_fee")
    private Double waterFee;

    @Column(name = "service_fee")
    private Double serviceFee;

    @Column(name = "total_amount")
    private Double totalAmount;


    @Column(name = "note")
    private String note;

    @Column(name = "image_proof")
    private String imageProof;


    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    private BillStatus status = BillStatus.PENDING;
}