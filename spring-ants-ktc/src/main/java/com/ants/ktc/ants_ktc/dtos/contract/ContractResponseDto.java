package com.ants.ktc.ants_ktc.dtos.contract;

import java.util.Date;
import java.util.List;
import java.util.UUID;

import com.ants.ktc.ants_ktc.dtos.bill.BillResponseDto;

import lombok.Data;

@Data
public class ContractResponseDto {
    private String contractName;
    private UUID id;
    private UUID roomId;
    private String roomTitle;
    private UUID tenantId;
    private String tenantName;
    private String tenantPhone;
    private UUID landlordId;
    private String landlordName;
    private Double depositAmount;
    private Date startDate;
    private Date endDate;
    private Double monthlyRent;
    private int status;
    private String contractImage;
    private List<BillResponseDto> bills; // Danh sách hóa đơn liên quan
    private PaymentInfoDto landlordPaymentInfo;
}