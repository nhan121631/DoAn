package com.ants.ktc.ants_ktc.dtos.blog;


import lombok.*;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BlogResponse {
    private UUID id;
    private String title;
    private String slug;
    private String content;
    private String category;
    private String thumbnailUrl;
    private UUID authorId;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private String status;
}