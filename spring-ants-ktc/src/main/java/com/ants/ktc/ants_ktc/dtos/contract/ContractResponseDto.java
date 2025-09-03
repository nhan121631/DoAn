package com.ants.ktc.ants_ktc.dtos.contract;


import com.ants.ktc.ants_ktc.dtos.bill.BillResponseDto;
import com.ants.ktc.ants_ktc.entities.Bill;
import lombok.Data;
import java.util.Date;
import java.util.List;
import java.util.UUID;

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
    private Date startDate;
    private Date endDate;
    private Double depositAmount;
    private Double monthlyRent;
    private int status;
    private List<BillResponseDto> bills; // Danh sách hóa đơn liên quan
}