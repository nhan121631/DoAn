package com.ants.ktc.ants_ktc.dtos.room;

import java.util.Date;
import java.util.List;

import org.springframework.web.multipart.MultipartFile;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;


@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class RoomRequestDto {
    private String title;
    private String description;
    private Double priceMonth;
    private Double priceDeposit;
    private int available;
    private int approval;
    private int hidden;
    private Date postStartDate;
    private Date postEndDate;
    private List<MultipartFile> images;
    private List<Long> convenientIds;
}
