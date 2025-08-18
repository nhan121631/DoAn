package com.ants.ktc.ants_ktc.dtos.message;

import java.time.LocalDateTime;
import java.util.UUID;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class MessageResponseDto {
    private UUID id;
    private String content;
    private UUID fromUser;
    private UUID toUser;
    private LocalDateTime sentAt;
    private boolean isRead;

    // Getters and Setters
}
