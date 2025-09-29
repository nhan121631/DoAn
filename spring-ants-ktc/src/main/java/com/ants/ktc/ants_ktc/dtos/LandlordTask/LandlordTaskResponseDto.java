package com.ants.ktc.ants_ktc.dtos.LandlordTask;

import lombok.Data;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
public class LandlordTaskResponseDto {
    private UUID id;
    private String title;
    private String description;
    private LocalDateTime startDate;
    private LocalDateTime dueDate;
    private String type;
    private UUID relatedEntityId;
    private String status;
    private String priority;
    private String landlordId;
    private String landlordName;
    private String roomId;
    private String roomTitle;

}