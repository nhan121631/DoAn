package com.ants.ktc.ants_ktc.services;

import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.CachePut;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;

import com.ants.ktc.ants_ktc.dtos.post_types.PostTypeJpaCreateDto;
import com.ants.ktc.ants_ktc.dtos.post_types.PostTypeJpaUpdateDto;
import com.ants.ktc.ants_ktc.dtos.post_types.PostTypeResponseDto;
import com.ants.ktc.ants_ktc.entities.PostType;
import com.ants.ktc.ants_ktc.repositories.PostTypeJpaRepository;
import com.ants.ktc.ants_ktc.repositories.TypePostProjection;

@Service
public class PostTypeService {

    @Autowired
    private PostTypeJpaRepository postTypeRepository;

    public PostTypeResponseDto convertDto(PostType postType) {
        return PostTypeResponseDto.builder()
                .id(postType.getId())
                .code(postType.getCode())
                .name(postType.getName())
                .pricePerDay(postType.getPricePerDay())
                .description(postType.getDescription())
                .build();
    }

    @CachePut(value = "typeposts", key = "#result.id")
    @CacheEvict(value = "typeposts", key = "'all'")
    public PostTypeResponseDto createPostType(PostTypeJpaCreateDto postTypeJpaCreateDto) {
        postTypeRepository.findByCode(postTypeJpaCreateDto.getCode())
                .ifPresent(existingPostType -> {
                    throw new IllegalArgumentException(
                            "Post type with code " + postTypeJpaCreateDto.getCode() + " already exists");
                });
        PostType postType = new PostType();
        postType.setCode(postTypeJpaCreateDto.getCode());
        postType.setName(postTypeJpaCreateDto.getName());
        postType.setPricePerDay(postTypeJpaCreateDto.getPricePerDay());
        postType.setDescription(postTypeJpaCreateDto.getDescription());
        postType = postTypeRepository.save(postType);
        return convertDto(postType);
    }

    @Cacheable(value = "typeposts", key = "'all'")
    public List<PostTypeResponseDto> getPostTypes() {
        System.out.println("Fetching all post types");
        List<TypePostProjection> postTypes = postTypeRepository.findAllActive();
        if (postTypes.isEmpty()) {
            throw new IllegalArgumentException("No post types found");
        }

        return postTypes.stream()
                .map((TypePostProjection p) -> PostTypeResponseDto.builder()
                        .id(UUID.fromString(p.getId()))
                        .code(p.getCode())
                        .name(p.getName())
                        .pricePerDay(p.getPricePerDay())
                        .description(p.getDescription())
                        .build())
                .collect(Collectors.toList());
    }

    @CachePut(value = "typeposts", key = "#root.args[0].id")
    @CacheEvict(value = "typeposts", key = "'all'")
    public PostTypeResponseDto updatePostType(PostTypeJpaUpdateDto postTypeJpaUpdateDto) {
        PostType postType = postTypeRepository.findById(postTypeJpaUpdateDto.getId())
                .orElseThrow(() -> new IllegalArgumentException(
                        "Post type not found with id: " + postTypeJpaUpdateDto.getId()));

        Optional<PostType> existing = postTypeRepository.findByCode(postTypeJpaUpdateDto.getCode());
        if (existing.isPresent() && !existing.get().getId().equals(postType.getId())) {
            throw new IllegalArgumentException(
                    "Post type with code " + postTypeJpaUpdateDto.getCode() + " already exists");
        }

        postType.setCode(postTypeJpaUpdateDto.getCode());
        postType.setName(postTypeJpaUpdateDto.getName());
        postType.setPricePerDay(postTypeJpaUpdateDto.getPricePerDay());
        postType.setDescription(postTypeJpaUpdateDto.getDescription());
        postType = postTypeRepository.save(postType);
        return convertDto(postType);
    }

    // @CachePut(value = "typeposts", key = "#root.args[0].id")
    @CacheEvict(value = "typeposts", key = "'all'")
    public void deletePostType(UUID id) {
        PostType postType = postTypeRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Post type not found with id: " + id));
        postType.setIsRemove(1); // Mark as removed
        postTypeRepository.save(postType);
    }
}
