package com.ants.ktc.ants_ktc.dtos.LandlordTask;

import jakarta.validation.constraints.FutureOrPresent;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LandlordTaskUpdateDto {
    @Size(max = 100, message = "Title must be less than 100 characters")
    private String title;

    @Size(max = 500, message = "Description must be less than 500 characters")
    private String description;

    @FutureOrPresent(message = "Start date must be today or in the future")
    private LocalDateTime startDate;

    @FutureOrPresent(message = "Due date must be today or in the future")
    private LocalDateTime dueDate;

    private String status; // optional update

    private String priority; // optional update

}
