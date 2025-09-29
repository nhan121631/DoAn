package com.ants.ktc.ants_ktc.dtos.temporary_residence;


import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Date;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TemporaryResidenceUpdateRequest {

    @NotBlank(message = "Full name must not be blank")
    @Size(max = 100, message = "Full name must not exceed 100 characters")
    private String fullName;

    @NotBlank(message = "ID number must not be blank")
    @Size(min = 12, max = 12, message = "ID number must be between 9 and 12 characters")
    private String idNumber;

    @Size(max = 50, message = "Relationship must not exceed 50 characters")
    private String relationship;

    @NotNull(message = "Start date must not be null")
    private Date startDate;

    @NotNull(message = "End date must not be null")
    private Date endDate;

    @Size(max = 255, message = "Note must not exceed 255 characters")
    private String note;
    @Size(max = 255, message = "Status must not exceed 255 characters")
    private String status;
}