package com.ants.ktc.ants_ktc.services;

import com.ants.ktc.ants_ktc.dtos.ads.AdsResponseDto;
import com.ants.ktc.ants_ktc.dtos.ads.CreateAdsDto;
import com.ants.ktc.ants_ktc.dtos.ads.UpdateAdsDto;
import com.ants.ktc.ants_ktc.entities.Ads;
import com.ants.ktc.ants_ktc.repositories.AdsRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@Transactional
public class AdsService {

    @Autowired
    private AdsRepository adsRepository;

    @Autowired
    private CloudinaryService cloudinaryService;

    private Date parseISODate(String isoDateString) {
        try {
            SimpleDateFormat format = new SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss.SSS'Z'");
            return format.parse(isoDateString);
        } catch (Exception e) {
            throw new IllegalArgumentException("Invalid date format: " + isoDateString);
        }
    }

    public AdsResponseDto createAds(CreateAdsDto createDto, MultipartFile imageFile) {
        // Parse dates
        Date startDate = parseISODate(createDto.getStartDate());
        Date endDate = parseISODate(createDto.getEndDate());

        // Validate dates
        if (startDate.after(endDate)) {
            throw new IllegalArgumentException("Start date must be before end date");
        }

        // Upload image
        Map<String, String> uploadResult = cloudinaryService.uploadFile(imageFile);

        // Create entity
        Ads ads = new Ads();
        ads.setTitle(createDto.getTitle());
        ads.setDescription(createDto.getDescription());
        ads.setImageUrl(uploadResult.get("url"));
        ads.setImagePublicId(uploadResult.get("publicId"));
        ads.setLinkUrl(createDto.getLinkUrl());
        ads.setPosition(createDto.getPosition());
        ads.setStartDate(startDate);
        ads.setEndDate(endDate);
        ads.setIsActive(createDto.getIsActive());
        ads.setPriority(createDto.getPriority());

        Ads saved = adsRepository.save(ads);
        return AdsResponseDto.fromEntity(saved);
    }

    public AdsResponseDto updateAds(UpdateAdsDto updateDto, MultipartFile imageFile) {
        Ads ads = adsRepository.findById(updateDto.getId())
                .orElseThrow(() -> new RuntimeException("Ads not found with id: " + updateDto.getId()));

        // Parse dates
        Date startDate = parseISODate(updateDto.getStartDate());
        Date endDate = parseISODate(updateDto.getEndDate());

        // Validate dates
        if (startDate.after(endDate)) {
            throw new IllegalArgumentException("Start date must be before end date");
        }

        // Update image if provided
        if (imageFile != null && !imageFile.isEmpty()) {
            // Delete old image
            if (ads.getImagePublicId() != null) {
                cloudinaryService.deleteFile(ads.getImagePublicId());
            }

            // Upload new image
            Map<String, String> uploadResult = cloudinaryService.uploadFile(imageFile);
            ads.setImageUrl(uploadResult.get("url"));
            ads.setImagePublicId(uploadResult.get("publicId"));
        }

        // Update other fields
        ads.setTitle(updateDto.getTitle());
        ads.setDescription(updateDto.getDescription());
        ads.setLinkUrl(updateDto.getLinkUrl());
        ads.setPosition(updateDto.getPosition());
        ads.setStartDate(startDate);
        ads.setEndDate(endDate);
        ads.setIsActive(updateDto.getIsActive());
        ads.setPriority(updateDto.getPriority());

        Ads saved = adsRepository.save(ads);
        return AdsResponseDto.fromEntity(saved);
    }

    public void deleteAds(UUID id) {
        Ads ads = adsRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Ads not found with id: " + id));

        // Delete image from Cloudinary
        if (ads.getImagePublicId() != null) {
            cloudinaryService.deleteFile(ads.getImagePublicId());
        }

        adsRepository.delete(ads);
    }

    // @Transactional(readOnly = true)
    // public AdsResponseDto getAdsById(UUID id) {
    //     Ads ads = adsRepository.findById(id)
    //             .orElseThrow(() -> new RuntimeException("Ads not found with id: " + id));
    //     return AdsResponseDto.fromEntity(ads);
    // }

    @Transactional(readOnly = true)
    public Page<AdsResponseDto> getAllAds(int page, int size, String sortBy, String sortDir) {
        Sort sort = sortDir.equalsIgnoreCase("desc") ? Sort.by(sortBy).descending() : Sort.by(sortBy).ascending();
        Pageable pageable = PageRequest.of(page, size, sort);

        Page<Ads> adsPage = adsRepository.findAll(pageable);
        return adsPage.map(AdsResponseDto::fromEntity);
    }

    // @Transactional(readOnly = true)
    // public List<AdsResponseDto> getActiveAds() {
    //     List<Ads> activeAds = adsRepository.findActiveAds(new Date());
    //     return activeAds.stream()
    //             .map(AdsResponseDto::fromEntity)
    //             .collect(Collectors.toList());
    // }

    @Transactional(readOnly = true)
    public List<AdsResponseDto> getActiveAdsByPosition(Ads.AdsPosition position) {
        List<Ads> activeAds = adsRepository.findActiveAdsByPosition(new Date(), position);
        return activeAds.stream()
                .map(AdsResponseDto::fromEntity)
                .collect(Collectors.toList());
    }

    // @Transactional(readOnly = true)
    // public Page<AdsResponseDto> searchAds(String keyword, int page, int size) {
    //     Pageable pageable = PageRequest.of(page, size, Sort.by("createdDate").descending());
    //     Page<Ads> adsPage = adsRepository.findByKeyword(keyword, pageable);
    //     return adsPage.map(AdsResponseDto::fromEntity);
    // }

    public AdsResponseDto toggleAdsStatus(UUID id) {
        Ads ads = adsRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Ads not found with id: " + id));

        ads.setIsActive(!ads.getIsActive());
        Ads saved = adsRepository.save(ads);
        return AdsResponseDto.fromEntity(saved);
    }
}
