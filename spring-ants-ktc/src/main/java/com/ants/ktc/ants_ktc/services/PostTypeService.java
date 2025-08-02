package com.ants.ktc.ants_ktc.services;

import java.util.Optional;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.ants.ktc.ants_ktc.dtos.post_types.PostTypeJpaCreateDto;
import com.ants.ktc.ants_ktc.dtos.post_types.PostTypeJpaUpdateDto;
import com.ants.ktc.ants_ktc.dtos.post_types.PostTypeResponseDto;
import com.ants.ktc.ants_ktc.entities.PostType;
import com.ants.ktc.ants_ktc.repositories.PostTypeRepository;

@Service
public class PostTypeService {

    @Autowired
    private PostTypeRepository postTypeRepository;

    public PostTypeResponseDto convertDto(PostType postType) {
        return PostTypeResponseDto.builder()
                .id(postType.getId())
                .code(postType.getCode())
                .name(postType.getName())
                .pricePerDay(postType.getPricePerDay())
                .description(postType.getDescription())
                .build();
    }

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

    // public List<PostTypeResponseDto> getPostTypes() {
    // List<PostType> postTypes = postTypeRepository.findAllActive();
    // if (postTypes.isEmpty()) {
    // throw new IllegalArgumentException("No post types found");
    // }
    // return postTypes.stream()
    // .map(this::convertDto)
    // .toList();
    // }

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

    public void deletePostType(UUID id) {
        PostType postType = postTypeRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Post type not found with id: " + id));
        postType.setIsRemove(1); // Mark as removed
        postTypeRepository.save(postType);
    }
}
