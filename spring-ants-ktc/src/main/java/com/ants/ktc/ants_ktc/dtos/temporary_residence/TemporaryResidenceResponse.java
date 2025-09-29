package com.ants.ktc.ants_ktc.dtos.temporary_residence;


import lombok.Builder;
import lombok.Data;

import java.util.Date;
import java.util.UUID;

@Data
@Builder
public class TemporaryResidenceResponse {
    private UUID id;
    private UUID contractId;
    private String fullName;
    private String idNumber;
    private String relationship;
    private Date startDate;
    private Date endDate;
    private String note;
    private String status;
    private String idCardFrontUrl;
    private String idCardBackUrl;
}
