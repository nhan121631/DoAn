package com.ants.ktc.ants_ktc.services;

import java.time.LocalDateTime;
import java.util.UUID;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import com.ants.ktc.ants_ktc.dtos.blog.BlogCreateRequest;
import com.ants.ktc.ants_ktc.dtos.blog.BlogResponse;
import com.ants.ktc.ants_ktc.dtos.blog.BlogUpdateRequest;
import com.ants.ktc.ants_ktc.entities.Blog;
import com.ants.ktc.ants_ktc.entities.User;
import com.ants.ktc.ants_ktc.enums.Category;
import com.ants.ktc.ants_ktc.enums.Status;
import com.ants.ktc.ants_ktc.repositories.BlogJpaRepository;
import com.ants.ktc.ants_ktc.repositories.UserJpaRepository;

import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class BlogService {

    private final BlogJpaRepository blogRepository;
    private final UserJpaRepository userRepository;

    // Create blog
    public BlogResponse createBlog(BlogCreateRequest request, UUID authorId) {
        User author = userRepository.findById(authorId)
                .orElseThrow(() -> new IllegalArgumentException("Author not found"));
        Blog blog = new Blog();
        blog.setTitle(request.getTitle());
        blog.setSlug(request.getSlug());
        blog.setContent(request.getContent());
        blog.setCategory(Category.valueOf(request.getCategory()));
        blog.setThumbnailUrl(author.getProfile().getAvatar());
        blog.setAuthorId(authorId);
        blog.setCreatedAt(LocalDateTime.now());
        blog.setUpdatedAt(LocalDateTime.now());
        blog.setStatus(Status.DRAFT); // mặc định khi tạo mới

        Blog saved = blogRepository.save(blog);
        return toResponse(saved);
    }

    // Update blog
    public BlogResponse updateBlog(UUID blogId, BlogUpdateRequest request) {
        Blog blog = blogRepository.findById(blogId)
                .orElseThrow(() -> new IllegalArgumentException("Blog not found"));

        blog.setTitle(request.getTitle());
        blog.setSlug(request.getSlug());
        blog.setContent(request.getContent());

        if (request.getCategory() != null) {
            blog.setCategory(Category.valueOf(request.getCategory()));
        }
        if (request.getStatus() != null) {
            blog.setStatus(Status.valueOf(request.getStatus()));
        }

        blog.setUpdatedAt(LocalDateTime.now());

        Blog updated = blogRepository.save(blog);
        return toResponse(updated);
    }

    // Delete blog
    public void deleteBlog(UUID blogId) {
        if (!blogRepository.existsById(blogId)) {
            throw new EntityNotFoundException("Blog not found");
        }
        blogRepository.deleteById(blogId);
    }

    // Get detail by slug
    public BlogResponse getBlogBySlug(String slug) {
        Blog blog = blogRepository.findBySlug(slug)
                .orElseThrow(() -> new EntityNotFoundException("Blog not found"));
        return toResponse(blog);
    }

    // List blog (by status + category optional)
    public Page<BlogResponse> listBlogs(Status status, Category category, Pageable pageable) {
        Page<Blog> page;
        if (status != null && category != null) {
            page = blogRepository.findByCategoryAndStatus(category, status, pageable);
        } else if (status != null) {
            page = blogRepository.findByStatus(status, pageable);
        } else {
            page = blogRepository.findAll(pageable);
        }
        return page.map(this::toResponse);
    }

    // Mapping entity -> response
    private BlogResponse toResponse(Blog blog) {
        BlogResponse response = new BlogResponse();
        response.setId(blog.getId());
        response.setTitle(blog.getTitle());
        response.setSlug(blog.getSlug());
        response.setContent(blog.getContent());
        response.setCategory(blog.getCategory().name());
        response.setThumbnailUrl(blog.getThumbnailUrl());
        response.setAuthorId(blog.getAuthorId());
        response.setCreatedAt(blog.getCreatedAt());
        response.setUpdatedAt(blog.getUpdatedAt());
        response.setStatus(blog.getStatus().name());
        return response;
    }
}