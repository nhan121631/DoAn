package com.ants.ktc.ants_ktc.entities;


import com.ants.ktc.ants_ktc.enums.Category;
import com.ants.ktc.ants_ktc.enums.Status;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "blogs")
@Data
@EqualsAndHashCode(callSuper = true)
public class Blog extends BaseEntity {

    private String title;

    @Column(unique = true, nullable = false)
    private String slug; // /blog/thong-bao-cap-nhat

    @Lob
    @Column(columnDefinition = "LONGTEXT") // để chứa HTML content dài
    private String content;

    @Enumerated(EnumType.STRING)
    private Category category;

    private String thumbnailUrl; // ảnh đại diện

    private UUID authorId; // id admin

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;

    @Enumerated(EnumType.STRING)
    private Status status;

}