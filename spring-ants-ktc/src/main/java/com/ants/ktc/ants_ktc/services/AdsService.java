package com.ants.ktc.ants_ktc.services;

import com.ants.ktc.ants_ktc.dtos.ads.AdsResponseDto;
import com.ants.ktc.ants_ktc.dtos.ads.CreateAdsDto;
import com.ants.ktc.ants_ktc.dtos.ads.UpdateAdsDto;
import com.ants.ktc.ants_ktc.entities.Ads;
import com.ants.ktc.ants_ktc.entities.User;
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

    @Autowired
    private UserService userService;

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

        // Get current authenticated user
        UUID currentUserId = userService.getAuthenticatedUserId();
        User currentUser = userService.findNameById(currentUserId);

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
        ads.setUser(currentUser); // Set user

        Ads saved = adsRepository.save(ads);
        return AdsResponseDto.fromEntity(saved);
    }

    public AdsResponseDto updateAds(UpdateAdsDto updateDto, MultipartFile imageFile) {
        Ads ads = adsRepository.findById(updateDto.getId())
                .orElseThrow(() -> new RuntimeException("Ads not found with id: " + updateDto.getId()));

        // Verify that the current user is the owner of the ads
        UUID currentUserId = userService.getAuthenticatedUserId();
        if (!ads.getUser().getId().equals(currentUserId)) {
            throw new RuntimeException("You are not authorized to update this advertisement");
        }

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

        // Verify that the current user is the owner of the ads
        UUID currentUserId = userService.getAuthenticatedUserId();
        if (!ads.getUser().getId().equals(currentUserId)) {
            throw new RuntimeException("You are not authorized to delete this advertisement");
        }

        // Delete image from Cloudinary
        if (ads.getImagePublicId() != null) {
            cloudinaryService.deleteFile(ads.getImagePublicId());
        }

        adsRepository.delete(ads);
    }

    // @Transactional(readOnly = true)
    // public AdsResponseDto getAdsById(UUID id) {
    // Ads ads = adsRepository.findById(id)
    // .orElseThrow(() -> new RuntimeException("Ads not found with id: " + id));
    // return AdsResponseDto.fromEntity(ads);
    // }

    @Transactional(readOnly = true)
    public Page<AdsResponseDto> getAllAds(int page, int size, String sortBy, String sortDir) {
        // Get current user's ads only
        UUID currentUserId = userService.getAuthenticatedUserId();

        Sort sort = sortDir.equalsIgnoreCase("desc") ? Sort.by(sortBy).descending() : Sort.by(sortBy).ascending();
        Pageable pageable = PageRequest.of(page, size, sort);

        Page<Ads> adsPage = adsRepository.findByUserId(currentUserId, pageable);
        return adsPage.map(AdsResponseDto::fromEntity);
    }

    // @Transactional(readOnly = true)
    // public List<AdsResponseDto> getActiveAds() {
    // List<Ads> activeAds = adsRepository.findActiveAds(new Date());
    // return activeAds.stream()
    // .map(AdsResponseDto::fromEntity)
    // .collect(Collectors.toList());
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
    // Pageable pageable = PageRequest.of(page, size,
    // Sort.by("createdDate").descending());
    // Page<Ads> adsPage = adsRepository.findByKeyword(keyword, pageable);
    // return adsPage.map(AdsResponseDto::fromEntity);
    // }

    public List<AdsResponseDto> checkConflicts(Ads.AdsPosition position, String startDateStr, String endDateStr,
            UUID excludeId) {
        // Parse dates
        Date startDate = parseISODate(startDateStr);
        Date endDate = parseISODate(endDateStr);

        // Get current user's ads only for conflict checking
        UUID currentUserId = userService.getAuthenticatedUserId();

        // Find all ads of current user in the same position that overlap with the date
        // range
        List<Ads> userAds = adsRepository.findUserAdsByPosition(currentUserId, position);

        return userAds.stream()
                .filter(ad -> {
                    // Exclude the current ad being edited
                    if (excludeId != null && ad.getId().equals(excludeId)) {
                        return false;
                    }

                    // Check for date overlap
                    return startDate.before(ad.getEndDate()) && endDate.after(ad.getStartDate());
                })
                .map(AdsResponseDto::fromEntity)
                .collect(Collectors.toList());
    }

    public AdsResponseDto toggleAdsStatus(UUID id) {
        Ads ads = adsRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Ads not found with id: " + id));

        // Verify that the current user is the owner of the ads
        UUID currentUserId = userService.getAuthenticatedUserId();
        if (!ads.getUser().getId().equals(currentUserId)) {
            throw new RuntimeException("You are not authorized to modify this advertisement");
        }

        ads.setIsActive(!ads.getIsActive());
        Ads saved = adsRepository.save(ads);
        return AdsResponseDto.fromEntity(saved);
    }
}
