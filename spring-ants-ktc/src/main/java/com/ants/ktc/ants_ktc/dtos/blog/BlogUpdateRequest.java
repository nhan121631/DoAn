package com.ants.ktc.ants_ktc.dtos.blog;


import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BlogUpdateRequest {

    @NotBlank(message = "Title không được để trống")
    @Size(max = 255, message = "Title tối đa 255 ký tự")
    private String title;

    @NotBlank(message = "Slug không được để trống")
    @Size(max = 255, message = "Slug tối đa 255 ký tự")
    private String slug;

    @NotBlank(message = "Content không được để trống")
    private String content;

    private String category;

    private String status; // DRAFT, PUBLISHED
}