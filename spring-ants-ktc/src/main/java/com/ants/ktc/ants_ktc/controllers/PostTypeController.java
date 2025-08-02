package com.ants.ktc.ants_ktc.controllers;

import java.util.List;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.ants.ktc.ants_ktc.dtos.post_types.PostTypeJpaCreateDto;
import com.ants.ktc.ants_ktc.dtos.post_types.PostTypeJpaUpdateDto;
import com.ants.ktc.ants_ktc.dtos.post_types.PostTypeResponseDto;
import com.ants.ktc.ants_ktc.services.PostTypeService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/post-types")
public class PostTypeController {
    @Autowired
    private PostTypeService postTypeService;

    @PostMapping
    public ResponseEntity<PostTypeResponseDto> createPostType(
            @RequestBody @Valid PostTypeJpaCreateDto postTypeJpaCreateDto) {
        PostTypeResponseDto dto = postTypeService.createPostType(postTypeJpaCreateDto);
        return ResponseEntity.status(201).body(dto);
    }

    @GetMapping
    public ResponseEntity<List<PostTypeResponseDto>> getPostTypes() {
        List<PostTypeResponseDto> postTypes = postTypeService.getPostTypes();
        if (postTypes.isEmpty()) {
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.ok(postTypes);
    }

    @PatchMapping
    public ResponseEntity<PostTypeResponseDto> updatePostType(
            @RequestBody @Valid PostTypeJpaUpdateDto postTypeJpaUpdateDto) {
        PostTypeResponseDto dto = postTypeService.updatePostType(postTypeJpaUpdateDto);
        return ResponseEntity.ok(dto);
    }

    @PatchMapping("/delete/{id}")
    public ResponseEntity<Void> deletePostType(@PathVariable("id") UUID id) {
        postTypeService.deletePostType(id);
        return ResponseEntity.noContent().build();
    }
}
