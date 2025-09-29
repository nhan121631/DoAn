package com.ants.ktc.ants_ktc.dtos.LandlordTask;

import jakarta.validation.constraints.FutureOrPresent;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LandlordTaskCreateDto {
    @NotBlank(message = "Title cannot be blank")
    @Size(max = 100, message = "Title must be less than 100 characters")
    private String title;

    @Size(max = 500, message = "Description must be less than 500 characters")
    private String description;

    @NotNull(message = "Start date cannot be null")
    @FutureOrPresent(message = "Start date must be today or in the future")
    private LocalDateTime startDate;

    @NotNull(message = "Due date cannot be null")
    @FutureOrPresent(message = "Due date must be today or in the future")
    private LocalDateTime dueDate;

    @NotBlank(message = "Status is required")
    private String status; // PENDING, IN_PROGRESS, COMPLETED, CANCELED

    @NotBlank(message = "Priority is required")
    private String priority; // LOW, MEDIUM, HIGH

    // @NotBlank(message = "Type is required")
    private String type; // REQUEST, BOOKING, RESIDENT, BILL, OTHER

    private UUID relatedEntityId;

    @NotBlank(message = "LandlordId cannot be blank")
    private String landlordId;

    private String roomId;
}