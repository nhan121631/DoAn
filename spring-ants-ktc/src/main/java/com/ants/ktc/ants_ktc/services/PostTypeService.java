package com.ants.ktc.ants_ktc.services;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.ants.ktc.ants_ktc.dtos.post_types.PostTypeJpaCreateDto;
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
                .build();
    }

    public PostTypeResponseDto createPostType(PostTypeJpaCreateDto postTypeJpaCreateDto) {
        postTypeRepository.findByCode(postTypeJpaCreateDto.getCode())
                .ifPresent(existingPostType -> {
                    throw new IllegalArgumentException("Post type with code " + postTypeJpaCreateDto.getCode() + " already exists.");
                });
        PostType postType = new PostType();
        postType.setCode(postTypeJpaCreateDto.getCode());
        postType.setName(postTypeJpaCreateDto.getName());
        postType.setPricePerDay(postTypeJpaCreateDto.getPricePerDay());
        postType = postTypeRepository.save(postType);
        return convertDto(postType);
    }
}
