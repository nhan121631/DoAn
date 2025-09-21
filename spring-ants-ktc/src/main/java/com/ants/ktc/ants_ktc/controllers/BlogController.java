package com.ants.ktc.ants_ktc.controllers;

import com.ants.ktc.ants_ktc.dtos.blog.BlogCreateRequest;
import com.ants.ktc.ants_ktc.dtos.blog.BlogResponse;
import com.ants.ktc.ants_ktc.dtos.blog.BlogUpdateRequest;
import com.ants.ktc.ants_ktc.enums.Category;
import com.ants.ktc.ants_ktc.enums.Status;
import com.ants.ktc.ants_ktc.services.BlogService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/blogs")
@RequiredArgsConstructor
public class BlogController {

    private final BlogService blogService;

    // Create (admin)
    @PostMapping
    public ResponseEntity<BlogResponse> createBlog(@Valid @RequestBody BlogCreateRequest request,
            @RequestParam("authorId") UUID authorId) {
        return ResponseEntity.ok(blogService.createBlog(request, authorId));
    }

    // Update (admin)
    @PutMapping("/{id}")
    public ResponseEntity<BlogResponse> updateBlog(@PathVariable("id") UUID id,
            @Valid @RequestBody BlogUpdateRequest request) {
        return ResponseEntity.ok(blogService.updateBlog(id, request));
    }

    // Delete (admin)
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteBlog(@PathVariable("id") UUID id) {
        blogService.deleteBlog(id);
        return ResponseEntity.noContent().build();
    }

    // Get detail by slug (public)
    @GetMapping("/slug/{slug}")
    public ResponseEntity<BlogResponse> getBlogBySlug(@PathVariable("slug") String slug) {
        return ResponseEntity.ok(blogService.getBlogBySlug(slug));
    }

    // List blogs (public)
    @GetMapping
    public ResponseEntity<Page<BlogResponse>> listBlogs(
            @RequestParam(value = "status", required = false) Status status,
            @RequestParam(value = "category", required = false) Category category,
            Pageable pageable) {
        return ResponseEntity.ok(blogService.listBlogs(status, category, pageable));
    }
}